import * as fs from 'fs-extra';
import simpleGit from 'simple-git';

import { GitService } from '../../services/git.service';

// Mock dependencies
jest.mock('simple-git');
jest.mock('fs-extra');

const mockFs = fs as any;
const mockSimpleGit = simpleGit as jest.MockedFunction<typeof simpleGit>;

describe('GitService', () => {
  let gitService: GitService;
  let mockGit: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGit = {
      clone: jest.fn().mockResolvedValue(undefined),
      pull: jest.fn().mockResolvedValue(undefined),
      checkout: jest.fn().mockResolvedValue(undefined),
      log: jest.fn(),
      show: jest.fn(),
      cwd: jest.fn().mockReturnThis(),
      init: jest.fn().mockResolvedValue(undefined),
      checkIsRepo: jest.fn().mockResolvedValue(true),
    };

    mockSimpleGit.mockReturnValue(mockGit as any);
    gitService = new GitService();
  });

  describe('cloneOrUpdateRepo', () => {
    it('should clone a new repository', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await gitService.cloneOrUpdateRepo('https://github.com/user/repo.git', '/path/to/repo');

      expect(mockGit.clone).toHaveBeenCalledWith(
        'https://github.com/user/repo.git',
        '/path/to/repo'
      );
    });

    it('should update an existing repository', async () => {
      mockFs.pathExists.mockResolvedValue(true);

      // Create a new git instance that will be returned by simpleGit
      const repoGit = {
        cwd: jest.fn().mockReturnThis(),
        pull: jest.fn().mockResolvedValue(undefined),
      };
      mockSimpleGit.mockReturnValueOnce(mockGit as any).mockReturnValueOnce(repoGit as any);

      await gitService.cloneOrUpdateRepo('https://github.com/user/repo.git', '/path/to/repo');

      expect(mockGit.clone).not.toHaveBeenCalled();
    });
  });

  describe('setupLocalRepo', () => {
    it('should call simple git for local repository', async () => {
      await gitService.setupLocalRepo('/path/to/local/repo');

      // Just verify it doesn't throw an error
      expect(mockSimpleGit).toHaveBeenCalled();
    });
  });

  describe('scanFolderForRepos', () => {
    it('should handle valid folder path', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);

      const repos = await gitService.scanFolderForRepos('/test/folder', 1);

      expect(Array.isArray(repos)).toBe(true);
    });

    it('should throw error for non-existent folder', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(gitService.scanFolderForRepos('/test/folder', 0)).rejects.toThrow(
        'Folder does not exist'
      );
    });
  });
});
