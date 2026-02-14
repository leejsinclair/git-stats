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
      raw: jest.fn(),
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

  describe('getFileChurnSince', () => {
    it('should parse numstat output and aggregate changes', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockGit.raw.mockResolvedValue(
        [
          '5\t2\tsrc/app.ts',
          '3\t1\tsrc/app.ts',
          '-\t-\tassets/logo.png',
          '12\t4\tpackage-lock.json',
          '6\t0\tREADME.md',
          '2\t2\tdocs/guide.adoc',
        ].join('\n')
      );

      const result = await gitService.getFileChurnSince('/path/to/repo');

      expect(result).toEqual([
        {
          filePath: 'src/app.ts',
          linesAdded: 8,
          linesDeleted: 3,
          totalChanges: 11,
        },
        {
          filePath: 'assets/logo.png',
          linesAdded: 0,
          linesDeleted: 0,
          totalChanges: 0,
        },
      ]);
    });

    it('should throw when repository does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(gitService.getFileChurnSince('/missing/repo')).rejects.toThrow(
        'Repository not found'
      );
    });
  });
});
