import { Request, Response, Router } from 'express';
import fs from 'fs-extra';
import path from 'path';

import { config } from '../../config';
import { GitService } from '../../services/git.service';
import { MetadataService } from '../../services/metadata.service';

export const gitRouter = Router();
const gitService = new GitService();
const metadataService = new MetadataService();

type FolderScanStatus = 'scanning' | 'analyzing' | 'complete' | 'error';

interface FolderScanProgress {
  scanId: string;
  status: FolderScanStatus;
  currentFolder: string | null;
  scannedCount: number;
  foundRepos: number;
  successfulAnalysis: number;
  failedAnalysis: number;
  message?: string;
  error?: string;
}

const folderScanJobs = new Map<string, FolderScanProgress>();

// Ensure data directories exist
fs.ensureDirSync(config.reposDir);
fs.ensureDirSync(config.outputDir);

/**
 * POST /api/git/analyze/remote
 * Analyzes a remote Git repository by cloning it first.
 *
 * @param req - Express request object with body containing repoUrl and optional branch
 * @param res - Express response object
 * @returns JSON response with analysis results and output file path
 */
gitRouter.post('/analyze/remote', async (req: Request, res: Response) => {
  try {
    const { repoUrl, branch = 'main' } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Create a safe directory name from the repo URL
    const repoName =
      repoUrl
        .split('/')
        .pop()
        ?.replace(/\.git$/, '') || 'repository';
    const localPath = path.join(config.reposDir, repoName);

    // Mark as analyzing
    await metadataService.updateRepoStatus(localPath, 'analyzing', {
      repoName,
      branch,
    });

    try {
      // Clone or update the repository
      await gitService.cloneOrUpdateRepo(repoUrl, localPath);

      // Analyze the repository
      const result = await gitService.analyzeRepository(localPath, branch);

      // Save the analysis result
      const outputPath = path.join(config.outputDir, `${repoName}-analysis-${Date.now()}.json`);
      await fs.writeJson(outputPath, result, { spaces: 2 });

      // Mark as ok
      await metadataService.updateRepoStatus(localPath, 'ok', {
        repoName,
        branch,
        outputFile: outputPath,
      });

      res.json({
        success: true,
        message: 'Remote repository analyzed successfully',
        data: result,
        savedTo: outputPath,
      });
    } catch (error) {
      // Mark as error
      await metadataService.updateRepoStatus(localPath, 'error', {
        repoName,
        branch,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  } catch (error) {
    console.error('Error analyzing remote repository:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze remote repository',
    });
  }
});

/**
 * POST /api/git/analyze/local
 * Analyzes a local Git repository at the specified path.
 *
 * @param req - Express request object with body containing repoPath and optional branch
 * @param res - Express response object
 * @returns JSON response with analysis results and output file path
 */
gitRouter.post('/analyze/local', async (req: Request, res: Response) => {
  try {
    const { repoPath, branch = 'main' } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Local repository path is required' });
    }

    // Resolve to absolute path if relative path is provided
    const absolutePath = path.isAbsolute(repoPath)
      ? repoPath
      : path.resolve(process.cwd(), repoPath);

    const repoName = path.basename(absolutePath);

    // Mark as analyzing
    await metadataService.updateRepoStatus(absolutePath, 'analyzing', {
      repoName,
      branch,
    });

    try {
      // Setup local repository
      await gitService.setupLocalRepo(absolutePath);

      // Analyze the repository
      const result = await gitService.analyzeRepository(absolutePath, branch);

      // Save the analysis result
      const outputPath = path.join(config.outputDir, `${repoName}-analysis-${Date.now()}.json`);
      await fs.writeJson(outputPath, result, { spaces: 2 });

      // Mark as ok
      await metadataService.updateRepoStatus(absolutePath, 'ok', {
        repoName,
        branch,
        outputFile: outputPath,
      });

      res.json({
        success: true,
        message: 'Local repository analyzed successfully',
        data: result,
        savedTo: outputPath,
      });
    } catch (error) {
      // Mark as error
      await metadataService.updateRepoStatus(absolutePath, 'error', {
        repoName,
        branch,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  } catch (error) {
    console.error('Error analyzing repository:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze repository',
    });
  }
});

/**
 * POST /api/git/analyze/folder
 * Scans a folder for Git repositories and analyzes each one found.
 *
 * @param req - Express request object with body containing folderPath, maxDepth, branch, and saveResults
 * @param res - Express response object
 * @returns JSON response with analysis results for all found repositories
 */
gitRouter.post('/analyze/folder', async (req: Request, res: Response) => {
  try {
    const { folderPath, maxDepth = 3, branch = 'main', saveResults = true } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    // Resolve to absolute path if relative path is provided
    const absolutePath = path.isAbsolute(folderPath)
      ? folderPath
      : path.resolve(process.cwd(), folderPath);

    // Scan for git repositories
    const foundRepos = await gitService.scanFolderForRepos(absolutePath, maxDepth);

    if (foundRepos.length === 0) {
      return res.json({
        success: true,
        message: 'No git repositories found',
        foundRepos: 0,
        results: [],
      });
    }

    // Analyze each repository
    const results = [];
    const errors = [];

    for (const repoPath of foundRepos) {
      const repoName = path.basename(repoPath);

      // Mark as analyzing
      await metadataService.updateRepoStatus(repoPath, 'analyzing', {
        repoName,
        branch,
      });

      try {
        await gitService.setupLocalRepo(repoPath);
        const result = await gitService.analyzeRepository(repoPath, branch);

        if (saveResults) {
          const outputPath = path.join(config.outputDir, `${repoName}-analysis-${Date.now()}.json`);
          await fs.writeJson(outputPath, result, { spaces: 2 });

          // Mark as ok
          await metadataService.updateRepoStatus(repoPath, 'ok', {
            repoName,
            branch,
            outputFile: outputPath,
          });

          results.push({
            repoPath,
            analysis: result,
            savedTo: outputPath,
          });
        } else {
          // Mark as ok
          await metadataService.updateRepoStatus(repoPath, 'ok', {
            repoName,
            branch,
          });

          results.push({
            repoPath,
            analysis: result,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Mark as error
        await metadataService.updateRepoStatus(repoPath, 'error', {
          repoName,
          branch,
          error: errorMessage,
        });

        errors.push({
          repoPath,
          error: errorMessage,
        });
      }
    }

    res.json({
      success: true,
      message: `Found and analyzed ${results.length} repositories`,
      foundRepos: foundRepos.length,
      successfulAnalysis: results.length,
      failedAnalysis: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error scanning folder for repositories:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan folder',
    });
  }
});

/**
 * POST /api/git/analyze/folder/async
 * Starts a folder scan and analysis job and returns a scan id for progress polling.
 *
 * @param req - Express request object with body containing folderPath, maxDepth, branch, and saveResults
 * @param res - Express response object
 * @returns JSON response with scan id
 */
gitRouter.post('/analyze/folder/async', async (req: Request, res: Response) => {
  try {
    const { folderPath, maxDepth = 3, branch = 'main', saveResults = true } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    const absolutePath = path.isAbsolute(folderPath)
      ? folderPath
      : path.resolve(process.cwd(), folderPath);

    const scanId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const progress: FolderScanProgress = {
      scanId,
      status: 'scanning',
      currentFolder: null,
      scannedCount: 0,
      foundRepos: 0,
      successfulAnalysis: 0,
      failedAnalysis: 0,
    };

    folderScanJobs.set(scanId, progress);

    res.json({ success: true, scanId });

    void (async () => {
      try {
        const foundRepos = await gitService.scanFolderForRepos(
          absolutePath,
          maxDepth,
          (currentPath, scannedCount) => {
            progress.currentFolder = currentPath;
            progress.scannedCount = scannedCount;
          }
        );

        progress.foundRepos = foundRepos.length;

        if (foundRepos.length === 0) {
          progress.status = 'complete';
          progress.message = 'No git repositories found';
          progress.currentFolder = null;
          return;
        }

        progress.status = 'analyzing';

        const results = [];
        const errors = [];

        for (const repoPath of foundRepos) {
          const repoName = path.basename(repoPath);
          progress.currentFolder = repoPath;

          await metadataService.updateRepoStatus(repoPath, 'analyzing', {
            repoName,
            branch,
          });

          try {
            await gitService.setupLocalRepo(repoPath);
            const result = await gitService.analyzeRepository(repoPath, branch);

            if (saveResults) {
              const outputPath = path.join(
                config.outputDir,
                `${repoName}-analysis-${Date.now()}.json`
              );
              await fs.writeJson(outputPath, result, { spaces: 2 });

              await metadataService.updateRepoStatus(repoPath, 'ok', {
                repoName,
                branch,
                outputFile: outputPath,
              });

              results.push({
                repoPath,
                analysis: result,
                savedTo: outputPath,
              });
            } else {
              await metadataService.updateRepoStatus(repoPath, 'ok', {
                repoName,
                branch,
              });

              results.push({
                repoPath,
                analysis: result,
              });
            }

            progress.successfulAnalysis += 1;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            await metadataService.updateRepoStatus(repoPath, 'error', {
              repoName,
              branch,
              error: errorMessage,
            });

            errors.push({ repoPath, error: errorMessage });
            progress.failedAnalysis += 1;
          }
        }

        progress.status = 'complete';
        progress.currentFolder = null;
        progress.message = `Found and analyzed ${results.length} repositories`;
      } catch (error) {
        progress.status = 'error';
        progress.currentFolder = null;
        progress.error = error instanceof Error ? error.message : 'Failed to scan folder';
      }
    })();
  } catch (error) {
    console.error('Error starting folder scan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start folder scan',
    });
  }
});

/**
 * GET /api/git/analyze/folder/progress/:scanId
 * Retrieves progress for a running or completed folder scan job.
 *
 * @param req - Express request object with scanId parameter
 * @param res - Express response object
 * @returns JSON response with progress details
 */
gitRouter.get('/analyze/folder/progress/:scanId', async (req: Request, res: Response) => {
  const { scanId } = req.params;
  const progress = folderScanJobs.get(scanId);

  if (!progress) {
    return res.status(404).json({
      success: false,
      error: 'Scan not found',
    });
  }

  return res.json({
    success: true,
    data: progress,
  });
});

/**
 * GET /api/git/info
 * Retrieves information about a Git repository (branches, remotes, etc.).
 *
 * @param req - Express request object with query parameter repoPath
 * @param res - Express response object
 * @returns JSON response with repository information
 */
gitRouter.get('/info', async (req: Request, res: Response) => {
  try {
    const { repoPath } = req.query;

    if (typeof repoPath !== 'string') {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    const info = await gitService.getRepositoryInfo(repoPath);
    res.json(info);
  } catch (error) {
    console.error('Error getting repository info:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repository info',
    });
  }
});

/**
 * GET /api/git/repos
 * Lists all cloned repositories in the repos directory.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with list of available repositories
 */
gitRouter.get('/repos', async (req: Request, res: Response) => {
  try {
    const repos = await fs.readdir(config.reposDir, { withFileTypes: true });
    const repoList = repos
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(config.reposDir, dirent.name),
      }));

    res.json({
      success: true,
      data: repoList,
    });
  } catch (error) {
    console.error('Error listing repositories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list repositories',
    });
  }
});

/**
 * GET /api/git/metadata
 * Returns metadata about all analyzed repositories.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with repository metadata
 */
gitRouter.get('/metadata', async (req: Request, res: Response) => {
  try {
    const metadata = await metadataService.readMetadata();
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('Error reading metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read metadata',
    });
  }
});

/**
 * GET /api/git/metadata/status/:status
 * Returns metadata for repositories filtered by status (ok, error, or analyzing).
 *
 * @param req - Express request object with status parameter
 * @param res - Express response object
 * @returns JSON response with filtered repository metadata
 */
gitRouter.get('/metadata/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    if (!['ok', 'error', 'analyzing'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: ok, error, analyzing',
      });
    }

    const repos = await metadataService.getReposByStatus(status as 'ok' | 'error' | 'analyzing');
    res.json({
      success: true,
      status,
      count: repos.length,
      data: repos,
    });
  } catch (error) {
    console.error('Error reading metadata by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read metadata',
    });
  }
});

/**
 * POST /api/git/metadata/clear-analyzing
 * Clears any repositories stuck in 'analyzing' status.
 * Useful for recovery after server crashes.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response confirming the operation
 */
gitRouter.post('/metadata/clear-analyzing', async (req: Request, res: Response) => {
  try {
    await metadataService.clearAnalyzingStatus();
    res.json({
      success: true,
      message: 'Cleared analyzing statuses',
    });
  } catch (error) {
    console.error('Error clearing analyzing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear analyzing statuses',
    });
  }
});
