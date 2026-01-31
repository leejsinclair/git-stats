import * as fs from 'fs-extra';

import { MetadataService } from '../../services/metadata.service';

// Mock fs-extra
jest.mock('fs-extra');
const mockFs = fs as any;

describe('MetadataService', () => {
  let metadataService: MetadataService;

  beforeEach(() => {
    jest.clearAllMocks();
    metadataService = new MetadataService();
  });

  describe('readMetadata', () => {
    it('should return existing metadata from file', async () => {
      const mockMetadata = {
        repositories: [
          {
            repoPath: '/path/to/repo',
            repoName: 'test-repo',
            status: 'ok' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
            outputFile: '/output/test.json',
          },
        ],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue(mockMetadata);

      const result = await metadataService.readMetadata();

      expect(result).toEqual(mockMetadata);
      expect(result.repositories).toHaveLength(1);
    });

    it('should return empty metadata when file does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const result = await metadataService.readMetadata();

      expect(result).toHaveProperty('repositories');
      expect(result.repositories).toHaveLength(0);
      expect(result).toHaveProperty('lastUpdated');
    });

    it('should handle read errors gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockRejectedValue(new Error('Read error'));

      const result = await metadataService.readMetadata();

      expect(result.repositories).toHaveLength(0);
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('writeMetadata', () => {
    it('should write metadata to file', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);

      const metadata = {
        repositories: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      await metadataService.writeMetadata(metadata);

      expect(mockFs.ensureDir).toHaveBeenCalled();
      expect(mockFs.writeJson).toHaveBeenCalled();
    });

    it('should update lastUpdated timestamp when writing', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);

      const metadata = {
        repositories: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      await metadataService.writeMetadata(metadata);

      // Check that writeJson was called with updated timestamp
      const writeCall = mockFs.writeJson.mock.calls[0];
      expect(writeCall[1].lastUpdated).not.toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw error on write failure', async () => {
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockRejectedValue(new Error('Write error'));

      const metadata = {
        repositories: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      await expect(metadataService.writeMetadata(metadata)).rejects.toThrow();
    });
  });

  describe('updateRepoStatus', () => {
    it('should add new repository to metadata', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);

      await metadataService.updateRepoStatus('/path/to/repo', 'analyzing', {
        repoName: 'test-repo',
        branch: 'main',
      });

      expect(mockFs.writeJson).toHaveBeenCalled();
      const writeCall = mockFs.writeJson.mock.calls[0];
      expect(writeCall[1].repositories).toHaveLength(1);
      expect(writeCall[1].repositories[0].status).toBe('analyzing');
    });

    it('should update existing repository status', async () => {
      const existingMetadata = {
        repositories: [
          {
            repoPath: '/path/to/repo',
            repoName: 'test-repo',
            status: 'analyzing' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
          },
        ],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue(existingMetadata);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);

      await metadataService.updateRepoStatus('/path/to/repo', 'ok', {
        repoName: 'test-repo',
        outputFile: '/output/result.json',
      });

      expect(mockFs.writeJson).toHaveBeenCalled();
      const writeCall = mockFs.writeJson.mock.calls[0];
      expect(writeCall[1].repositories[0].status).toBe('ok');
      expect(writeCall[1].repositories[0].outputFile).toBe('/output/result.json');
    });

    it('should record errors when status is error', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      mockFs.ensureDir.mockResolvedValue(undefined);
      mockFs.writeJson.mockResolvedValue(undefined);

      await metadataService.updateRepoStatus('/path/to/repo', 'error', {
        repoName: 'test-repo',
        error: 'Analysis failed',
      });

      const writeCall = mockFs.writeJson.mock.calls[0];
      expect(writeCall[1].repositories[0].status).toBe('error');
      expect(writeCall[1].repositories[0].error).toBe('Analysis failed');
    });
  });

  describe('getReposByStatus', () => {
    it('should filter repositories by status', async () => {
      const mockMetadata = {
        repositories: [
          {
            repoPath: '/path/to/repo1',
            repoName: 'repo1',
            status: 'ok' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
          },
          {
            repoPath: '/path/to/repo2',
            repoName: 'repo2',
            status: 'error' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
          },
          {
            repoPath: '/path/to/repo3',
            repoName: 'repo3',
            status: 'ok' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
          },
        ],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue(mockMetadata);

      const okRepos = await metadataService.getReposByStatus('ok');
      const errorRepos = await metadataService.getReposByStatus('error');

      expect(okRepos).toHaveLength(2);
      expect(errorRepos).toHaveLength(1);
      expect(okRepos.every(r => r.status === 'ok')).toBe(true);
      expect(errorRepos.every(r => r.status === 'error')).toBe(true);
    });

    it('should return empty array when no repos match status', async () => {
      const mockMetadata = {
        repositories: [
          {
            repoPath: '/path/to/repo',
            repoName: 'repo',
            status: 'ok' as const,
            lastAnalyzed: '2024-01-01T00:00:00.000Z',
          },
        ],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };

      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue(mockMetadata);

      const analyzingRepos = await metadataService.getReposByStatus('analyzing');

      expect(analyzingRepos).toHaveLength(0);
    });
  });
});
