import simpleGit, { SimpleGit } from 'simple-git';

export interface CommitMessageIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  line?: number;
}

export interface CommitMessageAnalysis {
  hash: string;
  author: string;
  date: string;
  message: string;
  subject: string;
  body: string;
  score: number; // 0-100
  passed: boolean;
  issues: CommitMessageIssue[];
}

export interface CommitMessageReport {
  totalCommits: number;
  analyzedCommits: number;
  overallScore: number;
  passRate: number;
  commits: CommitMessageAnalysis[];
  rulesSummary: {
    rule: string;
    violations: number;
    description: string;
  }[];
}

export class CommitMessageAnalyzerService {
  private git: SimpleGit;

  // Conventional Commits types
  private readonly conventionalTypes = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ];

  // Rules configuration
  private readonly rules = {
    subjectMaxLength: 50,
    bodyMaxLineLength: 72,
    subjectMinLength: 10,
  };

  constructor(repoPath?: string) {
    this.git = simpleGit(repoPath || process.cwd());
  }

  /**
   * Analyze commit messages in a repository
   */
  async analyzeRepository(
    repoPath: string,
    options: {
      branch?: string;
      limit?: number;
      since?: string;
      until?: string;
    } = {}
  ): Promise<CommitMessageReport> {
    this.git = simpleGit(repoPath);

    const { limit = 100, since, until } = options;

    try {
      // Get commit log
      const log = await this.git.log({
        maxCount: limit,
        ...(since && { '--since': since }),
        ...(until && { '--until': until }),
      });

      const commits: CommitMessageAnalysis[] = [];
      const ruleCounts: Record<string, number> = {};

      for (const commit of log.all) {
        const analysis = this.analyzeCommitMessage(
          commit.hash,
          commit.author_name,
          commit.date,
          commit.message
        );

        commits.push(analysis);

        // Count rule violations
        analysis.issues.forEach(issue => {
          ruleCounts[issue.rule] = (ruleCounts[issue.rule] || 0) + 1;
        });
      }

      const passedCommits = commits.filter(c => c.passed).length;
      const totalScore = commits.reduce((sum, c) => sum + c.score, 0);

      return {
        totalCommits: log.total,
        analyzedCommits: commits.length,
        overallScore: commits.length > 0 ? totalScore / commits.length : 0,
        passRate: commits.length > 0 ? (passedCommits / commits.length) * 100 : 0,
        commits,
        rulesSummary: this.generateRulesSummary(ruleCounts),
      };
    } catch (error) {
      throw new Error(
        `Failed to analyze repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze a single commit message
   */
  analyzeCommitMessage(
    hash: string,
    author: string,
    date: string,
    message: string
  ): CommitMessageAnalysis {
    const issues: CommitMessageIssue[] = [];
    const lines = message.split('\n');
    const subject = lines[0] || '';
    const body = lines.slice(2).join('\n').trim(); // Skip blank line after subject

    // Rule 1: Subject line should not be empty
    if (!subject.trim()) {
      issues.push({
        type: 'error',
        rule: 'subject-empty',
        message: 'Subject line must not be empty',
        line: 1,
      });
    }

    // Rule 2: Subject line length (ideally <= 50 chars)
    if (subject.length > this.rules.subjectMaxLength) {
      issues.push({
        type: subject.length > 72 ? 'error' : 'warning',
        rule: 'subject-length',
        message: `Subject line should be ${this.rules.subjectMaxLength} characters or less (currently ${subject.length})`,
        line: 1,
      });
    }

    // Rule 3: Subject should be meaningful (at least 10 chars)
    if (subject.trim().length < this.rules.subjectMinLength && subject.trim().length > 0) {
      issues.push({
        type: 'warning',
        rule: 'subject-min-length',
        message: `Subject line should be at least ${this.rules.subjectMinLength} characters (currently ${subject.trim().length})`,
        line: 1,
      });
    }

    // Rule 4: Subject should not end with a period
    if (subject.endsWith('.')) {
      issues.push({
        type: 'warning',
        rule: 'subject-period',
        message: 'Subject line should not end with a period',
        line: 1,
      });
    }

    // Rule 5: Subject should start with a capital letter (unless using conventional commits)
    const isConventionalCommit = this.conventionalTypes.some(
      type =>
        subject.toLowerCase().startsWith(`${type}:`) || subject.toLowerCase().startsWith(`${type}(`)
    );

    if (!isConventionalCommit && subject.length > 0 && subject[0] !== subject[0].toUpperCase()) {
      issues.push({
        type: 'info',
        rule: 'subject-capitalization',
        message: 'Subject line should start with a capital letter',
        line: 1,
      });
    }

    // Rule 6: Conventional Commits format validation
    if (this.looksLikeConventionalCommit(subject)) {
      const conventionalIssues = this.validateConventionalCommit(subject);
      issues.push(...conventionalIssues);
    }

    // Rule 7: Blank line between subject and body
    if (lines.length > 1 && lines[1] !== '') {
      issues.push({
        type: 'warning',
        rule: 'blank-line',
        message: 'There should be a blank line between subject and body',
        line: 2,
      });
    }

    // Rule 8: Body line length (ideally <= 72 chars)
    if (body) {
      const bodyLines = body.split('\n');
      bodyLines.forEach((line, index) => {
        if (line.length > this.rules.bodyMaxLineLength) {
          issues.push({
            type: 'info',
            rule: 'body-line-length',
            message: `Body line ${index + 3} exceeds ${this.rules.bodyMaxLineLength} characters (${line.length})`,
            line: index + 3,
          });
        }
      });
    }

    // Rule 9: Avoid generic messages
    const genericPatterns = [
      /^(wip|fix|update|change|minor|tmp|temp)$/i,
      /^(fixes?|updates?|changes?)$/i,
      /^(fixed|updated|changed)\s*$/i,
    ];

    if (genericPatterns.some(pattern => pattern.test(subject.trim()))) {
      issues.push({
        type: 'warning',
        rule: 'generic-message',
        message: 'Commit message appears too generic or vague',
        line: 1,
      });
    }

    // Calculate score (0-100)
    const score = this.calculateScore(issues);
    const passed = score >= 70 && !issues.some(i => i.type === 'error');

    return {
      hash,
      author,
      date,
      message,
      subject,
      body,
      score,
      passed,
      issues,
    };
  }

  /**
   * Check if commit message looks like it's trying to use Conventional Commits
   */
  private looksLikeConventionalCommit(subject: string): boolean {
    return /^[a-z]+(\([a-z0-9-]+\))?:/i.test(subject);
  }

  /**
   * Validate Conventional Commits format
   */
  private validateConventionalCommit(subject: string): CommitMessageIssue[] {
    const issues: CommitMessageIssue[] = [];

    // Extract type and scope
    const match = subject.match(/^([a-z]+)(\([a-z0-9-]+\))?:\s*(.+)$/i);

    if (!match) {
      issues.push({
        type: 'error',
        rule: 'conventional-format',
        message: 'Invalid Conventional Commits format. Expected: type(scope): description',
        line: 1,
      });
      return issues;
    }

    const [, type, scope, description] = match;

    // Validate type
    if (!this.conventionalTypes.includes(type.toLowerCase())) {
      issues.push({
        type: 'warning',
        rule: 'conventional-type',
        message: `Unknown conventional commit type "${type}". Common types: ${this.conventionalTypes.join(', ')}`,
        line: 1,
      });
    }

    // Type should be lowercase
    if (type !== type.toLowerCase()) {
      issues.push({
        type: 'error',
        rule: 'conventional-type-case',
        message: 'Conventional commit type must be lowercase',
        line: 1,
      });
    }

    // Scope should be lowercase if present
    if (scope && scope !== scope.toLowerCase()) {
      issues.push({
        type: 'error',
        rule: 'conventional-scope-case',
        message: 'Conventional commit scope must be lowercase',
        line: 1,
      });
    }

    // Description should not be empty
    if (!description || description.trim().length === 0) {
      issues.push({
        type: 'error',
        rule: 'conventional-description',
        message: 'Conventional commit description must not be empty',
        line: 1,
      });
    }

    // Description should be lowercase (conventional style)
    if (description && description[0] !== description[0].toLowerCase()) {
      issues.push({
        type: 'info',
        rule: 'conventional-description-case',
        message: 'Conventional commit description should start with lowercase',
        line: 1,
      });
    }

    return issues;
  }

  /**
   * Calculate score based on issues
   */
  private calculateScore(issues: CommitMessageIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Generate summary of rule violations
   */
  private generateRulesSummary(
    ruleCounts: Record<string, number>
  ): CommitMessageReport['rulesSummary'] {
    const ruleDescriptions: Record<string, string> = {
      'subject-empty': 'Subject line is empty',
      'subject-length': 'Subject line exceeds recommended length',
      'subject-min-length': 'Subject line is too short',
      'subject-period': 'Subject line ends with a period',
      'subject-capitalization': 'Subject line not capitalized',
      'conventional-format': 'Invalid Conventional Commits format',
      'conventional-type': 'Unknown or invalid commit type',
      'conventional-type-case': 'Commit type not lowercase',
      'conventional-scope-case': 'Commit scope not lowercase',
      'conventional-description': 'Commit description is empty',
      'conventional-description-case': 'Description not lowercase',
      'blank-line': 'Missing blank line between subject and body',
      'body-line-length': 'Body line exceeds recommended length',
      'generic-message': 'Generic or vague commit message',
    };

    return Object.entries(ruleCounts)
      .map(([rule, violations]) => ({
        rule,
        violations,
        description: ruleDescriptions[rule] || rule,
      }))
      .sort((a, b) => b.violations - a.violations);
  }
}
