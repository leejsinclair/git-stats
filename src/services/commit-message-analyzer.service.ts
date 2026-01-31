import simpleGit, { SimpleGit } from 'simple-git';

/**
 * Represents a single issue found in a commit message.
 */
export interface CommitMessageIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  line?: number;
}

/**
 * Complete analysis result for a single commit message.
 */
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

/**
 * Summary report for commit message analysis across multiple commits.
 */
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

/**
 * Service for analyzing commit messages for quality and compliance with best practices.
 * Supports Conventional Commits specification and general commit message guidelines.
 */
export class CommitMessageAnalyzerService {
  private git: SimpleGit;

  // Conventional Commits types - These are the standard types defined in the Conventional Commits specification
  // See: https://www.conventionalcommits.org/
  private readonly conventionalTypes = [
    'feat', // New feature
    'fix', // Bug fix
    'docs', // Documentation changes
    'style', // Code style/formatting (no logic change)
    'refactor', // Code restructuring (no behavior change)
    'perf', // Performance improvements
    'test', // Adding or updating tests
    'build', // Build system or dependency changes
    'ci', // CI/CD configuration changes
    'chore', // Maintenance tasks
    'revert', // Reverting previous commits
  ];

  // Commit message length limits - Based on widely accepted Git commit best practices
  // See: https://cbea.ms/git-commit/
  private readonly SUBJECT_MAX_LENGTH = 50; // 50 chars is the sweet spot (visible in GitHub, git log --oneline)
  private readonly SUBJECT_HARD_LIMIT = 72; // Absolute maximum before becoming an error
  private readonly SUBJECT_MIN_LENGTH = 10; // Ensures commits are descriptive enough
  private readonly BODY_MAX_LINE_LENGTH = 72; // 72 chars ensures readability in terminal and email clients

  // Scoring thresholds and penalties
  private readonly PASSING_SCORE_THRESHOLD = 70; // Minimum score to pass quality check
  private readonly DEFAULT_COMMIT_LIMIT = 100; // Default number of commits to analyze
  private readonly ERROR_PENALTY = 20; // Points deducted for error-level issues
  private readonly WARNING_PENALTY = 10; // Points deducted for warning-level issues
  private readonly INFO_PENALTY = 5; // Points deducted for info-level issues

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

    const { limit = this.DEFAULT_COMMIT_LIMIT, since, until } = options;

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
    const subject = lines[0] || ''; // First line is always the subject

    // Extract body starting from line 3 (index 2) - proper commit format has:
    // Line 1: Subject
    // Line 2: Blank line (separator)
    // Line 3+: Body text
    const body = lines.slice(2).join('\n').trim();

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
    // Subjects over 50 chars get a warning, over 72 chars get an error
    // This is because 50 is optimal, but 72 is the hard limit where truncation occurs
    if (subject.length > this.SUBJECT_MAX_LENGTH) {
      issues.push({
        type: subject.length > this.SUBJECT_HARD_LIMIT ? 'error' : 'warning',
        rule: 'subject-length',
        message: `Subject line should be ${this.SUBJECT_MAX_LENGTH} characters or less (currently ${subject.length})`,
        line: 1,
      });
    }

    // Rule 3: Subject should be meaningful (at least 10 chars)
    if (subject.trim().length < this.SUBJECT_MIN_LENGTH && subject.trim().length > 0) {
      issues.push({
        type: 'warning',
        rule: 'subject-min-length',
        message: `Subject line should be at least ${this.SUBJECT_MIN_LENGTH} characters (currently ${subject.trim().length})`,
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
    // Conventional commits start with lowercase type (e.g., "feat:"), so we exempt them
    // Check for both "type:" and "type(scope):" formats
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
        if (line.length > this.BODY_MAX_LINE_LENGTH) {
          // Add 3 to index because: line 1 = subject, line 2 = blank, body starts at line 3
          issues.push({
            type: 'info',
            rule: 'body-line-length',
            message: `Body line ${index + 3} exceeds ${this.BODY_MAX_LINE_LENGTH} characters (${line.length})`,
            line: index + 3,
          });
        }
      });
    }

    // Rule 9: Avoid generic messages
    // These patterns catch common lazy commit messages that don't provide meaningful context
    // Examples: "wip", "fix", "update", "changed" - these tell us nothing about what actually changed
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

    // Calculate score (0-100) based on issue severity
    const score = this.calculateScore(issues);
    // A commit "passes" if it scores at least 70/100 AND has no errors
    // This allows minor warnings/info issues while enforcing critical rules
    const passed = score >= this.PASSING_SCORE_THRESHOLD && !issues.some(i => i.type === 'error');

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
   * Checks if a commit message appears to follow Conventional Commits format.
   *
   * @param subject - Commit subject line to check
   * @returns True if the message looks like a Conventional Commit
   */
  private looksLikeConventionalCommit(subject: string): boolean {
    // Matches: type(optional-scope): description
    // Examples: "feat: add login", "fix(api): handle errors", "docs: update readme"
    // Pattern breakdown: ^[a-z]+ = type, (\([a-z0-9-]+\))? = optional scope, : = separator
    return /^[a-z]+(\([a-z0-9-]+\))?:/i.test(subject);
  }

  /**
   * Validates a Conventional Commits formatted message.
   * Checks type, scope, and description for proper formatting.
   *
   * @param subject - Commit subject line to validate
   * @returns Array of issues found in the conventional commit format
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

    // Extract parts using destructuring - first element (full match) is ignored
    // match[1] = type, match[2] = scope (with parens), match[3] = description
    const [, type, scope, description] = match;

    // Validate type against known conventional types
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
   * Calculates a quality score (0-100) based on issues found.
   *
   * @param issues - Array of issues found in the commit message
   * @returns Score from 0 (poor) to 100 (excellent)
   */
  private calculateScore(issues: CommitMessageIssue[]): number {
    let score = 100; // Start perfect, deduct points for issues

    // Apply penalties based on issue severity:
    // - Errors are critical violations (e.g., empty subject) = -20 points
    // - Warnings are important best practices (e.g., long subject) = -10 points
    // - Info items are nice-to-have guidelines (e.g., capitalization) = -5 points
    issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          score -= this.ERROR_PENALTY;
          break;
        case 'warning':
          score -= this.WARNING_PENALTY;
          break;
        case 'info':
          score -= this.INFO_PENALTY;
          break;
      }
    });

    // Ensure score never goes below 0
    return Math.max(0, score);
  }

  /**
   * Generates a summary of rule violations across all analyzed commits.
   *
   * @param ruleCounts - Record of rule violation counts
   * @returns Sorted array of rules with violation counts and descriptions
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

    // Convert violation counts to an array of rule summaries
    // Sort by violation count (descending) to show most problematic rules first
    // This helps teams prioritize which commit message issues to address
    return Object.entries(ruleCounts)
      .map(([rule, violations]) => ({
        rule,
        violations,
        description: ruleDescriptions[rule] || rule,
      }))
      .sort((a, b) => b.violations - a.violations);
  }
}
