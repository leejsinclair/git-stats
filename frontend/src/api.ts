import type { Metadata, RepoAnalysisResult, RepoMetadata } from './types';

const API_BASE_URL = 'http://localhost:3000/api/git';

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

  // Load analysis from output file
  async loadAnalysis(repoName: string, timestamp?: string): Promise<RepoAnalysisResult> {
    // This would need a new endpoint or we read from the outputFile path
    // For now, we'll assume analysis is served as static files or through an endpoint
    const response = await fetch(`/data/output/${repoName}-analysis-${timestamp}.json`);
    if (!response.ok) throw new Error('Failed to load analysis file');
    return await response.json();
  },
};
