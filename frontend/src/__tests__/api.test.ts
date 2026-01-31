import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';
import type { Metadata, RepoMetadata, DeveloperReport } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

function createFetchResponse<T>(data: T, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response;
}

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMetadata', () => {
    it('should fetch metadata successfully', async () => {
      const mockMetadata: Metadata = {
        repositories: [
          {
            repoName: 'test-repo',
            repoPath: '/path/to/repo',
            branch: 'main',
            lastAnalyzed: '2024-01-15',
            status: 'ok',
            outputFile: 'test.json',
          },
        ],
        lastUpdated: '2024-01-15',
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockMetadata })
      );

      const result = await api.getMetadata();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/metadata');
      expect(result).toEqual(mockMetadata);
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse({}, false));

      await expect(api.getMetadata()).rejects.toThrow('Failed to fetch metadata');
    });
  });

  describe('getReposByStatus', () => {
    it('should fetch repositories by status', async () => {
      const mockRepos: RepoMetadata[] = [
        {
          repoName: 'test-repo',
          repoPath: '/path/to/repo',
          branch: 'main',
          lastAnalyzed: '2024-01-15',
          status: 'ok',
          outputFile: 'test.json',
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockRepos })
      );

      const result = await api.getReposByStatus('ok');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/metadata/status/ok');
      expect(result).toEqual(mockRepos);
    });

    it('should handle different status values', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: [] })
      );

      await api.getReposByStatus('error');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/metadata/status/error');
    });
  });

  describe('analyzeLocal', () => {
    it('should analyze a local repository', async () => {
      const mockResult = {
        repoName: 'test-repo',
        totalCommits: 100,
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockResult })
      );

      const result = await api.analyzeLocal('/path/to/repo', 'main');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/analyze/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath: '/path/to/repo', branch: 'main' }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should use default branch if not provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: {} })
      );

      await api.analyzeLocal('/path/to/repo');

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.branch).toBe('main');
    });
  });

  describe('analyzeFolder', () => {
    it('should scan folder for repositories', async () => {
      const mockResult = {
        foundRepos: 5,
        successfulAnalysis: 5,
      };

      vi.mocked(fetch).mockResolvedValueOnce(createFetchResponse(mockResult));

      const result = await api.analyzeFolder('/path/to/folder');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/analyze/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath: '/path/to/folder',
          maxDepth: 3,
          branch: 'main',
          saveResults: true,
        }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should accept custom parameters', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ foundRepos: 0, successfulAnalysis: 0 })
      );

      await api.analyzeFolder('/path/to/folder', 5, 'develop', false);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.maxDepth).toBe(5);
      expect(body.branch).toBe('develop');
      expect(body.saveResults).toBe(false);
    });
  });

  describe('getDeveloperStats', () => {
    it('should fetch developer statistics', async () => {
      const mockReport: DeveloperReport = {
        totalDevelopers: 10,
        developers: [],
        generatedAt: '2024-01-15T10:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockReport })
      );

      const result = await api.getDeveloperStats();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/developers/stats');
      expect(result).toEqual(mockReport);
    });
  });

  describe('previewOldFiles', () => {
    it('should fetch old files for cleanup', async () => {
      const mockFiles = {
        oldFilesCount: 2,
        currentFilesCount: 5,
        totalFilesCount: 7,
        oldFiles: ['old-file-1.json', 'old-file-2.json'],
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockFiles })
      );

      const result = await api.previewOldFiles();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cleanup/old-files');
      expect(result).toEqual(mockFiles);
    });
  });

  describe('cleanupOldFiles', () => {
    it('should delete old files', async () => {
      const mockResult = {
        deletedCount: 2,
        deletedFiles: ['old-file-1.json', 'old-file-2.json'],
        message: 'Files deleted successfully',
      };

      vi.mocked(fetch).mockResolvedValueOnce(
        createFetchResponse({ data: mockResult })
      );

      const result = await api.cleanupOldFiles();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cleanup/old-files', {
        method: 'POST',
      });
      expect(result).toEqual(mockResult);
    });
  });
});
