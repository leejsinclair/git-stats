/**
 * Types for commit message analysis
 */

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

export interface AnalyzeCommitMessagesRequest {
  repoPath: string;
  branch?: string;
  limit?: number;
  since?: string;
  until?: string;
}

export interface AnalyzeCommitMessagesResponse {
  success: boolean;
  data?: CommitMessageReport;
  error?: string;
  savedTo?: string;
}
