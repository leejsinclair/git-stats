/**
 * Represents statistics for a single commit.
 */
export interface CommitStats {
  /** Full commit hash. */
  hash: string;
  /** Commit author name. */
  author: string;
  /** Commit author email. */
  email: string;
  /** Commit date in ISO format. */
  date: string;
  /** Commit message subject. */
  message: string;
  /** Lines added in this commit. */
  insertions: number;
  /** Lines deleted in this commit. */
  deletions: number;
  /** Files changed in this commit. */
  files: number;
}

/**
 * Represents aggregated statistics for a single week.
 */
export interface WeeklyStats {
  /** ISO date for week start (Monday). */
  weekStart: string;
  /** ISO week number. */
  weekNumber: number;
  /** Calendar year for the week. */
  year: number;
  /** Number of commits in the week. */
  commits: number;
  /** Lines added in the week. */
  linesAdded: number;
  /** Lines removed in the week. */
  linesRemoved: number;
  /** Unique authors who committed during the week. */
  authors: string[];
  /** Files changed in the week. */
  filesChanged: number;
  /** Commit hashes included in the week. */
  commitHashes: string[];
}

/**
 * Represents aggregated statistics for a single month.
 */
export interface MonthlyStats {
  /** Month identifier in YYYY-MM format. */
  month: string;
  /** Number of commits in the month. */
  commits: number;
  /** Lines added in the month. */
  linesAdded: number;
  /** Lines removed in the month. */
  linesRemoved: number;
  /** Unique authors who committed during the month. */
  authors: string[];
  /** Files changed in the month. */
  filesChanged: number;
  /** Weekly rollups contained in this month. */
  weeks: WeeklyStats[];
}

/**
 * Represents aggregated statistics for a single year.
 */
export interface YearlyStats {
  /** Calendar year. */
  year: number;
  /** Number of commits in the year. */
  commits: number;
  /** Lines added in the year. */
  linesAdded: number;
  /** Lines removed in the year. */
  linesRemoved: number;
  /** Unique authors who committed during the year. */
  authors: string[];
  /** Files changed in the year. */
  filesChanged: number;
  /** Monthly rollups contained in this year. */
  months: MonthlyStats[];
}

/**
 * Complete analysis result for a Git repository.
 */
export interface RepoAnalysisResult {
  /** Repository name. */
  repoName: string;
  /** Analyzed branch name. */
  branch: string;
  /** Total commit count. */
  totalCommits: number;
  /** Unique author names. */
  authors: string[];
  /** Date range covered by the analysis. */
  dateRange: {
    /** ISO date of the first commit. */
    firstCommit: string | null;
    /** ISO date of the latest commit. */
    lastCommit: string | null;
  };
  /** Summary totals across all commits. */
  summary: {
    /** Total lines added. */
    totalLinesAdded: number;
    /** Total lines removed. */
    totalLinesRemoved: number;
    /** Total files changed. */
    totalFilesChanged: number;
    /** Commit counts by author name. */
    authorContribution: Record<string, number>;
  };
  /** Time-based aggregations. */
  aggregations: {
    /** Yearly rollups. */
    yearly: YearlyStats[];
    /** Monthly rollups. */
    monthly: MonthlyStats[];
    /** Weekly rollups. */
    weekly: WeeklyStats[];
  };
  /** Recent commits in detail. */
  recentCommits: CommitStats[];
  /** Code churn summary for the selected window. */
  codeChurn: CodeChurnSummary;
}

/**
 * Represents churn statistics for a single file.
 */
export interface FileChurnStats {
  /** Relative file path in the repository. */
  filePath: string;
  /** Lines added within the time window. */
  linesAdded: number;
  /** Lines deleted within the time window. */
  linesDeleted: number;
  /** Total churn (added + deleted). */
  totalChanges: number;
}

/**
 * Represents churn summary for a repository over a time window.
 */
export interface CodeChurnSummary {
  /** Git --since filter used to compute churn. */
  since: string;
  /** Total lines added across all included files. */
  linesAdded: number;
  /** Total lines deleted across all included files. */
  linesDeleted: number;
  /** Total churn across all included files. */
  totalChanges: number;
  /** Per-file churn breakdown sorted by highest changes. */
  files: FileChurnStats[];
}

/**
 * Metadata for a repository tracked by the analysis pipeline.
 */
export interface RepoMetadata {
  /** Absolute path to the repository. */
  repoPath: string;
  /** Repository display name. */
  repoName: string;
  /** Analysis status. */
  status: 'ok' | 'error' | 'analyzing';
  /** Timestamp of the last analysis run. */
  lastAnalyzed: string;
  /** Saved output file location, if available. */
  outputFile?: string;
  /** Error message when analysis fails. */
  error?: string;
  /** Branch used for analysis. */
  branch?: string;
}

/**
 * Summary metadata describing analyzed repositories.
 */
export interface Metadata {
  /** Repositories tracked by the system. */
  repositories: RepoMetadata[];
  /** Timestamp of the last metadata update. */
  lastUpdated: string;
}

/**
 * High-level commit metrics for a developer.
 */
export interface DeveloperCommitMetrics {
  /** Total commits authored. */
  totalCommits: number;
  /** Lines added by the developer. */
  linesAdded: number;
  /** Lines removed by the developer. */
  linesRemoved: number;
  /** Total lines modified (added + removed). */
  linesModified: number;
  /** Repositories contributed to. */
  repositories: string[];
  /** Percentage of documentation-related commits. */
  documentationRatio: number;
  /** Percentage of test-related commits. */
  testRatio: number;
}

/**
 * Commit message quality statistics for a developer.
 */
export interface DeveloperMessageCompliance {
  /** Total commit messages evaluated. */
  totalMessages: number;
  /** Commit messages meeting the rules. */
  validMessages: number;
  /** Average compliance score. */
  averageScore: number;
  /** Percentage of passing messages. */
  passPercentage: number;
  /** Most common validation issues. */
  commonIssues: {
    /** Rule identifier. */
    rule: string;
    /** Number of occurrences. */
    count: number;
    /** Human-readable description. */
    description: string;
  }[];
}

/**
 * Activity metrics describing a developer's cadence over time.
 */
export interface DeveloperActivity {
  /** Total number of days in the observed window. */
  totalDays: number;
  /** Days with at least one commit. */
  activeDays: number;
  /** Average commits per active day. */
  averageCommitsPerDay: number;
  /** Date with the highest commit count. */
  mostActiveDay: string | null;
  /** Commit counts by day of week. */
  commitsByDayOfWeek: Record<string, number>;
  /** Commit counts by hour of day. */
  commitsByHour: Record<number, number>;
  /** Recent activity breakdown by date. */
  recentActivity: {
    /** Date of activity. */
    date: string;
    /** Commits on the date. */
    commits: number;
    /** Lines added on the date. */
    linesAdded: number;
    /** Lines removed on the date. */
    linesRemoved: number;
  }[];
}

/**
 * Distribution of commit sizes for a developer.
 */
export interface CommitSizeDistribution {
  /** Count of tiny commits. */
  tiny: number;
  /** Count of small commits. */
  small: number;
  /** Count of medium commits. */
  medium: number;
  /** Count of large commits. */
  large: number;
  /** Count of huge commits. */
  huge: number;
  /** Average lines changed per commit. */
  averageLinesPerCommit: number;
  /** Median lines changed per commit. */
  medianLinesPerCommit: number;
}

/**
 * Distribution of conventional commit types for a developer.
 */
export interface CommitTypeDistribution {
  /** Feature commits. */
  feat: number;
  /** Fix commits. */
  fix: number;
  /** Documentation commits. */
  docs: number;
  /** Style-only commits. */
  style: number;
  /** Refactor commits. */
  refactor: number;
  /** Performance commits. */
  perf: number;
  /** Test commits. */
  test: number;
  /** Build commits. */
  build: number;
  /** CI commits. */
  ci: number;
  /** Chore commits. */
  chore: number;
  /** Uncategorized commits. */
  other: number;
  /** Ratio of fix commits to total conventional commits. */
  bugFixRatio: number;
}

/**
 * File churn details derived from developer activity.
 */
export interface FileChurn {
  /** File path relative to the repository. */
  filePath: string;
  /** Total change count for the file. */
  changes: number;
  /** Number of commits touching the file. */
  commits: number;
  /** ISO timestamp of the last modification. */
  lastModified: string;
}

/**
 * Working hours insights derived from commit timestamps.
 */
export interface WorkingHoursAnalysis {
  /** Commits during late-night hours. */
  lateNightCommits: number;
  /** Commits on weekends. */
  weekendCommits: number;
  /** Commits during business hours. */
  businessHoursCommits: number;
  /** Late-night commits as a percentage. */
  lateNightPercentage: number;
  /** Weekend commits as a percentage. */
  weekendPercentage: number;
  /** Preferred working time of day. */
  preferredWorkingHours: string;
}

/**
 * Complete set of metrics for a single developer.
 */
export interface DeveloperStats {
  /** Developer name. */
  name: string;
  /** Developer email. */
  email: string;
  /** Aggregate commit metrics. */
  metrics: DeveloperCommitMetrics;
  /** Commit message compliance metrics, if available. */
  messageCompliance?: DeveloperMessageCompliance;
  /** Activity metrics for the developer. */
  activity: DeveloperActivity;
  /** Commit size distribution metrics. */
  commitSizeDistribution: CommitSizeDistribution;
  /** Commit type distribution metrics. */
  commitTypeDistribution: CommitTypeDistribution;
  /** File churn metrics for the developer. */
  fileChurn: FileChurn[];
  /** Working hours analysis derived from commits. */
  workingHoursAnalysis: WorkingHoursAnalysis;
  /** Recent commits attributed to the developer. */
  recentCommits: {
    /** Commit hash. */
    hash: string;
    /** Commit date in ISO format. */
    date: string;
    /** Commit message subject. */
    message: string;
    /** Repository name. */
    repo: string;
    /** Lines added in the commit. */
    insertions: number;
    /** Lines deleted in the commit. */
    deletions: number;
  }[];
}

/**
 * Aggregated developer report covering all contributors.
 */
export interface DeveloperReport {
  /** Total number of developers analyzed. */
  totalDevelopers: number;
  /** Per-developer statistics. */
  developers: DeveloperStats[];
  /** Report generation timestamp. */
  generatedAt: string;
}
