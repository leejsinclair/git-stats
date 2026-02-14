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
      diffSummary: jest.fn(),
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

      expect(mockGit.raw).toHaveBeenCalledWith([
        'log',
        '--numstat',
        '--pretty=format:',
        '--since=1 month ago',
      ]);

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

    it('should sort files by totalChanges in descending order', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockGit.raw.mockResolvedValue(
        ['10\t0\tsrc/high.ts', '1\t1\tsrc/low.ts', '3\t2\tsrc/mid.ts'].join('\n')
      );

      const result = await gitService.getFileChurnSince('/path/to/repo');

      const filePaths = result.map(r => r.filePath);
      const totalChanges = result.map(r => r.totalChanges);

      expect(filePaths).toEqual(['src/high.ts', 'src/mid.ts', 'src/low.ts']);
      expect(totalChanges).toEqual([10, 5, 2]);
    });
    it('should throw when repository does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(gitService.getFileChurnSince('/missing/repo')).rejects.toThrow(
        'Repository not found'
      );
    });
  });

  describe('analyzeRepository', () => {
    it('should return empty analysis when repository has no commits', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockGit.log.mockRejectedValue(new Error('does not have any commits yet'));

      const result = await gitService.analyzeRepository('/path/to/repo');

      expect(result.totalCommits).toBe(0);
      expect(result.recentCommits).toEqual([]);
      expect(result.codeChurn.totalChanges).toBe(0);
    });

    it('should throw when repository path does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(gitService.analyzeRepository('/missing/repo')).rejects.toThrow(
        'Repository not found'
      );
    });

    it('should tolerate diff summary failures and still return results', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockGit.log.mockResolvedValue({
        all: [
          {
            hash: 'a1',
            author: 'Dev',
            email: 'dev@example.com',
            date: new Date('2024-01-02').toISOString(),
            message: 'first',
          },
          {
            hash: 'b2',
            author: 'Dev',
            email: 'dev@example.com',
            date: new Date('2024-01-01').toISOString(),
            message: 'second',
          },
        ],
      });
      mockGit.diffSummary.mockRejectedValue(new Error('diff failed'));
      jest.spyOn(gitService, 'getFileChurnSince').mockResolvedValue([]);

      const result = await gitService.analyzeRepository('/path/to/repo');

      expect(result.totalCommits).toBe(2);
      expect(result.summary.totalLinesAdded).toBe(0);
      expect(result.summary.totalLinesRemoved).toBe(0);
    });
  });
});
