/**
 * Types for commit message analysis
 */

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
 * Request payload for analyzing commit messages in a repository.
 */
export interface AnalyzeCommitMessagesRequest {
  repoPath: string;
  branch?: string;
  limit?: number;
  since?: string;
  until?: string;
}

/**
 * Response payload for commit message analysis requests.
 */
export interface AnalyzeCommitMessagesResponse {
  success: boolean;
  data?: CommitMessageReport;
  error?: string;
  savedTo?: string;
}
