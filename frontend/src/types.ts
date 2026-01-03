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
