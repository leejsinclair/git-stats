export interface CommitStats {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  insertions: number;
  deletions: number;
  files: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekNumber: number;
  year: number;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  commitHashes: string[];
}

export interface MonthlyStats {
  month: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  weeks: WeeklyStats[];
}

export interface YearlyStats {
  year: number;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  months: MonthlyStats[];
}

export interface RepoAnalysisResult {
  repoName: string;
  branch: string;
  totalCommits: number;
  authors: string[];
  dateRange: {
    firstCommit: string | null;
    lastCommit: string | null;
  };
  summary: {
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
    authorContribution: Record<string, number>;
  };
  aggregations: {
    yearly: YearlyStats[];
    monthly: MonthlyStats[];
    weekly: WeeklyStats[];
  };
  recentCommits: CommitStats[];
}

export interface RepoMetadata {
  repoPath: string;
  repoName: string;
  status: 'ok' | 'error' | 'analyzing';
  lastAnalyzed: string;
  outputFile?: string;
  error?: string;
  branch?: string;
}

export interface Metadata {
  repositories: RepoMetadata[];
  lastUpdated: string;
}

export interface DeveloperCommitMetrics {
  totalCommits: number;
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  repositories: string[];
}

export interface DeveloperMessageCompliance {
  totalMessages: number;
  validMessages: number;
  averageScore: number;
  passPercentage: number;
  commonIssues: {
    rule: string;
    count: number;
    description: string;
  }[];
}

export interface DeveloperActivity {
  totalDays: number;
  activeDays: number;
  averageCommitsPerDay: number;
  mostActiveDay: string | null;
  commitsByDayOfWeek: Record<string, number>;
  commitsByHour: Record<number, number>;
  recentActivity: {
    date: string;
    commits: number;
    linesAdded: number;
    linesRemoved: number;
  }[];
}

export interface CommitSizeDistribution {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  huge: number;
  averageLinesPerCommit: number;
  medianLinesPerCommit: number;
}

export interface CommitTypeDistribution {
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
  bugFixRatio: number;
}

export interface FileChurn {
  filePath: string;
  changes: number;
  commits: number;
  lastModified: string;
}

export interface WorkingHoursAnalysis {
  lateNightCommits: number;
  weekendCommits: number;
  businessHoursCommits: number;
  lateNightPercentage: number;
  weekendPercentage: number;
  preferredWorkingHours: string;
}

export interface DeveloperStats {
  name: string;
  email: string;
  metrics: DeveloperCommitMetrics;
  messageCompliance?: DeveloperMessageCompliance;
  activity: DeveloperActivity;
  commitSizeDistribution: CommitSizeDistribution;
  commitTypeDistribution: CommitTypeDistribution;
  fileChurn: FileChurn[];
  workingHoursAnalysis: WorkingHoursAnalysis;
  recentCommits: {
    hash: string;
    date: string;
    message: string;
    repo: string;
    insertions: number;
    deletions: number;
  }[];
}

export interface DeveloperReport {
  totalDevelopers: number;
  developers: DeveloperStats[];
  generatedAt: string;
}
