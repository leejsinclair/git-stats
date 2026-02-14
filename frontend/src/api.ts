import type { Metadata, RepoAnalysisResult, RepoMetadata, DeveloperReport } from './types';

const API_BASE_URL = 'http://localhost:3000/api/git';
const DEVELOPER_API_URL = 'http://localhost:3000/api/developers';
const CLEANUP_API_URL = 'http://localhost:3000/api/cleanup';

export interface FolderScanProgress {
  scanId: string;
  status: 'scanning' | 'analyzing' | 'complete' | 'error';
  currentFolder: string | null;
  scannedCount: number;
  foundRepos: number;
  successfulAnalysis: number;
  failedAnalysis: number;
  message?: string;
  error?: string;
}

export const api = {
  // Get all metadata
  async getMetadata(): Promise<Metadata> {
    const response = await fetch(`${API_BASE_URL}/metadata`);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    const data = await response.json();
    return data.data;
  },

  // Get repos by status
  async getReposByStatus(status: 'ok' | 'error' | 'analyzing'): Promise<RepoMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/metadata/status/${status}`);
    if (!response.ok) throw new Error(`Failed to fetch repos with status ${status}`);
    const data = await response.json();
    return data.data;
  },

  // Analyze a local repository
  async analyzeLocal(repoPath: string, branch: string = 'main'): Promise<RepoAnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/analyze/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, branch }),
    });
    if (!response.ok) throw new Error('Failed to analyze repository');
    const data = await response.json();
    return data.data;
  },

  // Analyze a folder
  async analyzeFolder(
    folderPath: string,
    maxDepth: number = 3,
    branch: string = 'main',
    saveResults: boolean = true
  ): Promise<{foundRepos: number; successfulAnalysis: number}> {
    const response = await fetch(`${API_BASE_URL}/analyze/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath, maxDepth, branch, saveResults }),
    });
    if (!response.ok) throw new Error('Failed to scan folder');
    return await response.json();
  },

  // Start a folder scan job and return a scan id
  async startFolderScan(
    folderPath: string,
    maxDepth: number = 3,
    branch: string = 'main',
    saveResults: boolean = true
  ): Promise<{ scanId: string }> {
    const response = await fetch(`${API_BASE_URL}/analyze/folder/async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath, maxDepth, branch, saveResults }),
    });
    if (!response.ok) throw new Error('Failed to start folder scan');
    const data = await response.json();
    return data;
  },

  // Get progress for a folder scan job
  async getFolderScanProgress(scanId: string): Promise<FolderScanProgress> {
    const response = await fetch(`${API_BASE_URL}/analyze/folder/progress/${scanId}`);
    if (!response.ok) throw new Error('Failed to fetch scan progress');
    const data = await response.json();
    return data.data;
  },

  // Load analysis from output file
  async loadAnalysis(repoName: string, timestamp?: string): Promise<RepoAnalysisResult> {
    // This would need a new endpoint or we read from the outputFile path
    // For now, we'll assume analysis is served as static files or through an endpoint
    const response = await fetch(`/data/output/${repoName}-analysis-${timestamp}.json`);
    if (!response.ok) throw new Error('Failed to load analysis file');
    return await response.json();
  },

  // Get developer statistics
  async getDeveloperStats(): Promise<DeveloperReport> {
    const response = await fetch(`${DEVELOPER_API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch developer statistics');
    const data = await response.json();
    return data.data;
  },

  // Preview old files to be cleaned up
  async previewOldFiles(): Promise<{ oldFilesCount: number; currentFilesCount: number; totalFilesCount: number; oldFiles: string[] }> {
    const response = await fetch(`${CLEANUP_API_URL}/old-files`);
    if (!response.ok) throw new Error('Failed to preview old files');
    const data = await response.json();
    return data.data;
  },

  // Clean up old analysis files
  async cleanupOldFiles(): Promise<{ deletedCount: number; deletedFiles: string[]; message: string }> {
    const response = await fetch(`${CLEANUP_API_URL}/old-files`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cleanup old files');
    const data = await response.json();
    return data.data;
  },
};
