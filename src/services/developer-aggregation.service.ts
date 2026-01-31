import * as fs from 'fs/promises';
import * as path from 'path';

import { CommitMessageAnalyzerService } from './commit-message-analyzer.service';

interface CommitSizeDistribution {
  tiny: number; // 1-10 lines
  small: number; // 11-50 lines
  medium: number; // 51-200 lines
  large: number; // 201-400 lines
  huge: number; // 401+ lines
  averageLinesPerCommit: number;
  medianLinesPerCommit: number;
}

interface CommitTypeDistribution {
  feat: number;
  fix: number;
  docs: number;
  style: number;
  refactor: number;
  perf: number;
  test: number;
  build: number;
  ci: number;
  chore: number;
  other: number;
  bugFixRatio: number; // fix / total
}

interface FileChurn {
  filePath: string;
  changes: number;
}

interface WorkingHoursAnalysis {
  lateNightCommits: number; // 10 PM - 6 AM
  weekendCommits: number;
  businessHoursCommits: number; // 9 AM - 5 PM weekdays
  lateNightPercentage: number;
  weekendPercentage: number;
  preferredWorkingHours: string; // e.g., "morning", "afternoon", "evening", "night"
}

interface DeveloperMetrics {
  totalCommits: number;
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  repositories: string[];
  documentationRatio: number; // docs/README commits / total commits
  testRatio: number; // test commits / total commits
}

interface MessageComplianceMetrics {
  totalMessages: number;
  validMessages: number;
  averageScore: number;
  passPercentage: number;
  commonIssues: Array<{
    rule: string;
    count: number;
    description: string;
  }>;
}

interface RecentActivity {
  date: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
}

interface DeveloperActivity {
  totalDays: number;
  activeDays: number;
  averageCommitsPerDay: number;
  mostActiveDay: string | null;
  commitsByDayOfWeek: Record<string, number>;
  commitsByHour: Record<number, number>;
  recentActivity: RecentActivity[];
}

interface Commit {
  hash: string;
  message: string;
  date: string;
  repository: string;
  insertions: number;
  deletions: number;
}

export interface DeveloperStats {
  name: string;
  email: string;
  metrics: DeveloperMetrics;
  messageCompliance: MessageComplianceMetrics;
  activity: DeveloperActivity;
  recentCommits: Commit[];
  commitSizeDistribution: CommitSizeDistribution;
  commitTypeDistribution: CommitTypeDistribution;
  fileChurn: FileChurn[];
  workingHoursAnalysis: WorkingHoursAnalysis;
}

export interface DeveloperReport {
  totalDevelopers: number;
  developers: DeveloperStats[];
  generatedAt: string;
}

export class DeveloperAggregationService {
  private dataDir = path.join(process.cwd(), 'data', 'output');
  private messageAnalyzer = new CommitMessageAnalyzerService();

  async aggregateDevelopers(): Promise<DeveloperReport> {
    const developerMap = new Map<string, DeveloperStats>();

    // Read metadata to get list of current analysis files and repository names
    let gitStatsFiles: string[] = [];
    const repoNameMap = new Map<string, string>();

    try {
      const metadataPath = path.join(this.dataDir, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      for (const repo of metadata.repositories || []) {
        if (repo.outputFile && repo.status === 'ok') {
          const filename = repo.outputFile.split('/').pop();
          repoNameMap.set(filename, repo.repoName);
          gitStatsFiles.push(filename);
        }
      }
    } catch (error) {
      console.warn('Could not read metadata.json, falling back to reading all files');
      // Fallback: read all analysis files
      const files = await fs.readdir(this.dataDir);
      gitStatsFiles = files.filter(
        f => f.includes('-analysis-') && f.endsWith('.json') && !f.startsWith('commit-messages-')
      );
    }

    // Process git stats files
    for (const file of gitStatsFiles) {
      const content = await fs.readFile(path.join(this.dataDir, file), 'utf-8');
      const data = JSON.parse(content);

      // Get repository name from metadata, or fall back to filename extraction
      const repoName = repoNameMap.get(file) || file.split('-analysis-')[0] || 'unknown';

      // Process commits - the actual commit data is in recentCommits array
      const commits = data.recentCommits || [];

      for (const commit of commits) {
        const authorName = commit.author;
        const authorEmail = commit.email;
        const key = `${authorName}-${authorEmail}`;

        if (!developerMap.has(key)) {
          developerMap.set(key, {
            name: authorName,
            email: authorEmail,
            metrics: {
              totalCommits: 0,
              linesAdded: 0,
              linesRemoved: 0,
              linesModified: 0,
              repositories: [],
              documentationRatio: 0,
              testRatio: 0,
            },
            messageCompliance: {
              totalMessages: 0,
              validMessages: 0,
              averageScore: 0,
              passPercentage: 0,
              commonIssues: [],
            },
            activity: {
              totalDays: 0,
              activeDays: 0,
              averageCommitsPerDay: 0,
              mostActiveDay: null,
              commitsByDayOfWeek: {
                Sunday: 0,
                Monday: 0,
                Tuesday: 0,
                Wednesday: 0,
                Thursday: 0,
                Friday: 0,
                Saturday: 0,
              },
              commitsByHour: {},
              recentActivity: [],
            },
            recentCommits: [],
            commitSizeDistribution: {
              tiny: 0,
              small: 0,
              medium: 0,
              large: 0,
              huge: 0,
              averageLinesPerCommit: 0,
              medianLinesPerCommit: 0,
            },
            commitTypeDistribution: {
              feat: 0,
              fix: 0,
              docs: 0,
              style: 0,
              refactor: 0,
              perf: 0,
              test: 0,
              build: 0,
              ci: 0,
              chore: 0,
              other: 0,
              bugFixRatio: 0,
            },
            fileChurn: [],
            workingHoursAnalysis: {
              lateNightCommits: 0,
              weekendCommits: 0,
              businessHoursCommits: 0,
              lateNightPercentage: 0,
              weekendPercentage: 0,
              preferredWorkingHours: 'unknown',
            },
          });
        }

        const dev = developerMap.get(key)!;

        // Aggregate metrics from commit
        dev.metrics.totalCommits++;
        dev.metrics.linesAdded += commit.insertions || 0;
        dev.metrics.linesRemoved += commit.deletions || 0;
        dev.metrics.linesModified += (commit.insertions || 0) + (commit.deletions || 0);

        // Track repositories (use repoName extracted from filename)
        if (!dev.metrics.repositories.includes(repoName)) {
          dev.metrics.repositories.push(repoName);
        }

        // Add commit to recent commits
        dev.recentCommits.push({
          hash: commit.hash,
          message: commit.message,
          date: commit.date,
          repository: repoName,
          insertions: commit.insertions || 0,
          deletions: commit.deletions || 0,
        });

        // Analyze commit message
        const messageAnalysis = this.messageAnalyzer.analyzeCommitMessage(
          commit.hash,
          commit.author,
          commit.date,
          commit.message
        );
        dev.messageCompliance.totalMessages++;
        if (messageAnalysis.passed) {
          dev.messageCompliance.validMessages++;
        }

        // Track issues from this message
        for (const issue of messageAnalysis.issues || []) {
          const existing = dev.messageCompliance.commonIssues.find(i => i.rule === issue.rule);
          if (existing) {
            existing.count++;
          } else {
            dev.messageCompliance.commonIssues.push({
              rule: issue.rule,
              count: 1,
              description: issue.message,
            });
          }
        }
      }
    }

    // Calculate derived metrics for each developer
    for (const dev of developerMap.values()) {
      // Message compliance
      if (dev.messageCompliance.totalMessages > 0) {
        dev.messageCompliance.passPercentage =
          (dev.messageCompliance.validMessages / dev.messageCompliance.totalMessages) * 100;

        // Calculate average score from recent commits
        let totalScore = 0;
        for (const commit of dev.recentCommits) {
          const analysis = this.messageAnalyzer.analyzeCommitMessage(
            commit.hash,
            commit.repository, // Using repository as author name placeholder
            commit.date,
            commit.message
          );
          totalScore += analysis.score;
        }
        dev.messageCompliance.averageScore = totalScore / dev.recentCommits.length;

        // Sort common issues by count
        dev.messageCompliance.commonIssues.sort((a, b) => b.count - a.count);
        dev.messageCompliance.commonIssues = dev.messageCompliance.commonIssues.slice(0, 5); // Top 5
      }

      // Activity metrics
      this.calculateActivityMetrics(dev);

      // New metrics
      this.calculateCommitSizeDistribution(dev);
      this.calculateCommitTypeDistribution(dev);
      this.calculateFileChurn(dev);
      this.calculateWorkingHoursAnalysis(dev);
      this.calculateDocumentationAndTestRatios(dev);
    }

    const developers = Array.from(developerMap.values()).sort(
      (a, b) => b.metrics.totalCommits - a.metrics.totalCommits
    );

    return {
      totalDevelopers: developers.length,
      developers,
      generatedAt: new Date().toISOString(),
    };
  }

  private calculateActivityMetrics(dev: DeveloperStats): void {
    if (dev.recentCommits.length === 0) return;

    // Sort commits by date
    const sortedCommits = [...dev.recentCommits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group commits by day
    const commitsByDay = new Map<string, typeof sortedCommits>();
    const dayOfWeekCounts: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };
    const hourCounts: Record<number, number> = {};

    for (const commit of sortedCommits) {
      const date = new Date(commit.date);
      const dayKey = date.toISOString().split('T')[0];

      if (!commitsByDay.has(dayKey)) {
        commitsByDay.set(dayKey, []);
      }
      commitsByDay.get(dayKey)!.push(commit);

      // Day of week
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayOfWeek = dayNames[date.getDay()];
      dayOfWeekCounts[dayOfWeek]++;

      // Hour of day
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    // Calculate metrics
    const firstDate = new Date(sortedCommits[0].date);
    const lastDate = new Date(sortedCommits[sortedCommits.length - 1].date);
    const totalDays =
      Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const activeDays = commitsByDay.size;

    // Find most active day
    let mostActiveDay: string | null = null;
    let maxCommits = 0;
    for (const [day, commits] of commitsByDay) {
      if (commits.length > maxCommits) {
        maxCommits = commits.length;
        mostActiveDay = day;
      }
    }

    // Recent activity (last 30 days worth of data)
    const recentActivity = Array.from(commitsByDay.entries())
      .slice(-30)
      .map(([date, commits]) => ({
        date,
        commits: commits.length,
        linesAdded: commits.reduce((sum: number, c) => sum + c.insertions, 0),
        linesRemoved: commits.reduce((sum: number, c) => sum + c.deletions, 0),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    dev.activity = {
      totalDays,
      activeDays,
      averageCommitsPerDay: totalDays > 0 ? dev.metrics.totalCommits / totalDays : 0,
      mostActiveDay,
      commitsByDayOfWeek: dayOfWeekCounts,
      commitsByHour: hourCounts,
      recentActivity,
    };

    // Sort recent commits by date (most recent first)
    dev.recentCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    dev.recentCommits = dev.recentCommits.slice(0, 50); // Keep top 50 most recent
  }

  /**
   * Calculate commit size distribution
   */
  private calculateCommitSizeDistribution(dev: DeveloperStats): void {
    const commitSizes: number[] = [];

    for (const commit of dev.recentCommits) {
      const size = commit.insertions + commit.deletions;
      commitSizes.push(size);

      // Categorize by size
      if (size <= 10) {
        dev.commitSizeDistribution.tiny++;
      } else if (size <= 50) {
        dev.commitSizeDistribution.small++;
      } else if (size <= 200) {
        dev.commitSizeDistribution.medium++;
      } else if (size <= 400) {
        dev.commitSizeDistribution.large++;
      } else {
        dev.commitSizeDistribution.huge++;
      }
    }

    // Calculate average and median
    if (commitSizes.length > 0) {
      dev.commitSizeDistribution.averageLinesPerCommit =
        commitSizes.reduce((sum, size) => sum + size, 0) / commitSizes.length;

      const sorted = [...commitSizes].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      dev.commitSizeDistribution.medianLinesPerCommit =
        sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
    }
  }

  /**
   * Calculate commit type distribution
   */
  private calculateCommitTypeDistribution(dev: DeveloperStats): void {
    let totalConventionalCommits = 0;

    for (const commit of dev.recentCommits) {
      // Parse Conventional Commit format
      const match = commit.message.match(/^(\w+)(\(.+?\))?:/);
      if (match) {
        const type = match[1];
        totalConventionalCommits++;

        switch (type) {
          case 'feat':
            dev.commitTypeDistribution.feat++;
            break;
          case 'fix':
            dev.commitTypeDistribution.fix++;
            break;
          case 'docs':
            dev.commitTypeDistribution.docs++;
            break;
          case 'style':
            dev.commitTypeDistribution.style++;
            break;
          case 'refactor':
            dev.commitTypeDistribution.refactor++;
            break;
          case 'perf':
            dev.commitTypeDistribution.perf++;
            break;
          case 'test':
            dev.commitTypeDistribution.test++;
            break;
          case 'build':
            dev.commitTypeDistribution.build++;
            break;
          case 'ci':
            dev.commitTypeDistribution.ci++;
            break;
          case 'chore':
            dev.commitTypeDistribution.chore++;
            break;
          default:
            dev.commitTypeDistribution.other++;
        }
      }
    }

    // Calculate bug fix ratio
    if (totalConventionalCommits > 0) {
      dev.commitTypeDistribution.bugFixRatio =
        dev.commitTypeDistribution.fix / totalConventionalCommits;
    }
  }

  /**
   * Calculate file churn (most frequently modified files)
   * Note: This requires per-file git data which is not in the current analysis structure
   * TODO: Enhance git.service.ts to include file-level statistics
   */
  private calculateFileChurn(dev: DeveloperStats): void {
    // Placeholder - requires additional git data
    dev.fileChurn = [];
  }

  /**
   * Calculate working hours analysis
   */
  private calculateWorkingHoursAnalysis(dev: DeveloperStats): void {
    let lateNightCount = 0;
    let weekendCount = 0;
    let businessHoursCount = 0;
    const hourDistribution: number[] = new Array(24).fill(0);

    for (const commit of dev.recentCommits) {
      const date = new Date(commit.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      hourDistribution[hour]++;

      // Late night: 10 PM (22:00) to 6 AM (6:00)
      if (hour >= 22 || hour < 6) {
        lateNightCount++;
      }

      // Weekend: Saturday or Sunday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCount++;
      }

      // Business hours: 9 AM to 5 PM on weekdays
      if (hour >= 9 && hour < 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        businessHoursCount++;
      }
    }

    const totalCommits = dev.recentCommits.length;

    dev.workingHoursAnalysis.lateNightCommits = lateNightCount;
    dev.workingHoursAnalysis.weekendCommits = weekendCount;
    dev.workingHoursAnalysis.businessHoursCommits = businessHoursCount;
    dev.workingHoursAnalysis.lateNightPercentage =
      totalCommits > 0 ? (lateNightCount / totalCommits) * 100 : 0;
    dev.workingHoursAnalysis.weekendPercentage =
      totalCommits > 0 ? (weekendCount / totalCommits) * 100 : 0;

    // Determine preferred working hours
    const morningCount = hourDistribution.slice(6, 12).reduce((sum, c) => sum + c, 0);
    const afternoonCount = hourDistribution.slice(12, 18).reduce((sum, c) => sum + c, 0);
    const eveningCount = hourDistribution.slice(18, 22).reduce((sum, c) => sum + c, 0);
    const nightCount = [...hourDistribution.slice(22), ...hourDistribution.slice(0, 6)].reduce(
      (sum, c) => sum + c,
      0
    );

    const maxCount = Math.max(morningCount, afternoonCount, eveningCount, nightCount);
    if (maxCount === morningCount) {
      dev.workingHoursAnalysis.preferredWorkingHours = 'morning';
    } else if (maxCount === afternoonCount) {
      dev.workingHoursAnalysis.preferredWorkingHours = 'afternoon';
    } else if (maxCount === eveningCount) {
      dev.workingHoursAnalysis.preferredWorkingHours = 'evening';
    } else {
      dev.workingHoursAnalysis.preferredWorkingHours = 'night';
    }
  }

  /**
   * Calculate documentation and test ratios
   */
  private calculateDocumentationAndTestRatios(dev: DeveloperStats): void {
    if (dev.recentCommits.length === 0) return;

    let docCommits = 0;
    let testCommits = 0;

    for (const commit of dev.recentCommits) {
      const message = commit.message.toLowerCase();

      // Check if it's a documentation commit
      // Look for docs keywords in message or conventional commit type
      if (
        message.startsWith('docs:') ||
        message.startsWith('docs(') ||
        /\b(readme|documentation|docs|doc|guide|tutorial)\b/i.test(message)
      ) {
        docCommits++;
      }

      // Check if it's a test commit
      // Look for test keywords in message or conventional commit type
      if (
        message.startsWith('test:') ||
        message.startsWith('test(') ||
        /\b(test|tests|testing|spec|specs)\b/i.test(message)
      ) {
        testCommits++;
      }
    }

    const totalCommits = dev.metrics.totalCommits;
    dev.metrics.documentationRatio = totalCommits > 0 ? (docCommits / totalCommits) * 100 : 0;
    dev.metrics.testRatio = totalCommits > 0 ? (testCommits / totalCommits) * 100 : 0;
  }

  /**
   * Get rule description for commit message rules
   */
  private getRuleDescription(rule: string): string {
    const descriptions: Record<string, string> = {
      'subject-empty': 'Subject line is empty',
      'subject-length': 'Subject line exceeds recommended length',
      'subject-min-length': 'Subject line is too short',
      'subject-period': 'Subject line ends with a period',
      'subject-capitalization': 'Subject line not capitalized',
      'conventional-format': 'Invalid Conventional Commits format',
      'conventional-type': 'Unknown or invalid commit type',
      'conventional-scope-empty': 'Scope is empty in Conventional Commit',
      'body-empty': 'Body is empty when it should explain the change',
      'body-length': 'Body line exceeds recommended length',
      'imperative-mood': 'Subject not in imperative mood',
      'subject-no-ticket': 'Missing ticket/issue reference',
      'subject-prefix': 'Invalid commit message prefix',
      'breaking-change': 'Breaking change not properly documented',
    };

    return descriptions[rule] || rule;
  }

  async getDeveloperStats(developerName: string): Promise<DeveloperStats | null> {
    const report = await this.aggregateDevelopers();
    return report.developers.find(d => d.name === developerName) || null;
  }
}
