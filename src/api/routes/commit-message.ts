import { Request, Response, Router } from 'express';
import fs from 'fs-extra';
import path from 'path';

import { config } from '../../config';
import { AnalyzeCommitMessagesRequest } from '../../models/commit-message.types';
import { CommitMessageAnalyzerService } from '../../services/commit-message-analyzer.service';

export const commitMessageRouter = Router();

/**
 * POST /api/commit-messages/analyze
 * Analyzes commit messages in a local repository for quality and compliance.
 *
 * @param req - Express request object with body containing repoPath, branch, limit, since, until
 * @param res - Express response object
 * @returns JSON response with commit message analysis results
 */
commitMessageRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { repoPath, branch, limit, since, until }: AnalyzeCommitMessagesRequest = req.body;

    if (!repoPath) {
      return res.status(400).json({
        success: false,
        error: 'Repository path is required',
      });
    }

    // Resolve to absolute path if relative path is provided
    const absolutePath = path.isAbsolute(repoPath)
      ? repoPath
      : path.resolve(process.cwd(), repoPath);

    // Check if the path exists
    if (!(await fs.pathExists(absolutePath))) {
      return res.status(404).json({
        success: false,
        error: `Repository path not found: ${absolutePath}`,
      });
    }

    const analyzer = new CommitMessageAnalyzerService(absolutePath);
    const result = await analyzer.analyzeRepository(absolutePath, {
      branch,
      limit,
      since,
      until,
    });

    // Save the analysis result
    const repoName = path.basename(absolutePath);
    const outputPath = path.join(
      config.outputDir,
      `${repoName}-commit-messages-${Date.now()}.json`
    );
    await fs.writeJson(outputPath, result, { spaces: 2 });

    res.json({
      success: true,
      data: result,
      savedTo: outputPath,
    });
  } catch (error) {
    console.error('Error analyzing commit messages:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze commit messages',
    });
  }
});

/**
 * POST /api/commit-messages/analyze/repo/:repoName
 * Analyzes commit messages in a previously cloned repository.
 *
 * @param req - Express request object with repoName parameter and optional query params
 * @param res - Express response object
 * @returns JSON response with commit message analysis results
 */
commitMessageRouter.post('/analyze/repo/:repoName', async (req: Request, res: Response) => {
  try {
    const repoNameParam = req.params.repoName;
    const repoName = Array.isArray(repoNameParam) ? repoNameParam[0] : repoNameParam;
    const { branch, limit, since, until } = req.body;

    if (!repoName) {
      return res.status(400).json({
        success: false,
        error: 'Repository name is required',
      });
    }

    const repoPath = path.join(config.reposDir, repoName);

    // Check if the repository exists
    if (!(await fs.pathExists(repoPath))) {
      return res.status(404).json({
        success: false,
        error: `Repository not found: ${repoName}. Please analyze the repository first.`,
      });
    }

    const analyzer = new CommitMessageAnalyzerService(repoPath);
    const result = await analyzer.analyzeRepository(repoPath, {
      branch,
      limit,
      since,
      until,
    });

    // Save the analysis result
    const outputPath = path.join(
      config.outputDir,
      `${repoName}-commit-messages-${Date.now()}.json`
    );
    await fs.writeJson(outputPath, result, { spaces: 2 });

    res.json({
      success: true,
      data: result,
      savedTo: outputPath,
    });
  } catch (error) {
    console.error('Error analyzing commit messages:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze commit messages',
    });
  }
});

/**
 * GET /api/commit-messages/best-practices
 * Returns information about commit message best practices and guidelines.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with best practices documentation
 */
commitMessageRouter.get('/best-practices', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      title: 'Commit Message Best Practices',
      rules: [
        {
          name: 'subject-length',
          description: 'Subject line should be 50 characters or less',
          severity: 'warning',
          maxLength: 50,
        },
        {
          name: 'subject-capitalization',
          description: 'Subject line should start with a capital letter',
          severity: 'info',
        },
        {
          name: 'subject-period',
          description: 'Subject line should not end with a period',
          severity: 'warning',
        },
        {
          name: 'blank-line',
          description: 'Separate subject from body with a blank line',
          severity: 'warning',
        },
        {
          name: 'body-line-length',
          description: 'Body lines should be 72 characters or less',
          severity: 'info',
          maxLength: 72,
        },
        {
          name: 'generic-message',
          description: 'Avoid generic messages like "fix", "update", "wip"',
          severity: 'warning',
        },
      ],
      conventionalCommits: {
        description:
          'Conventional Commits is a specification for adding human and machine readable meaning to commit messages',
        format: 'type(scope): description',
        types: [
          { name: 'feat', description: 'A new feature' },
          { name: 'fix', description: 'A bug fix' },
          { name: 'docs', description: 'Documentation only changes' },
          {
            name: 'style',
            description: 'Changes that do not affect code meaning (formatting, etc)',
          },
          {
            name: 'refactor',
            description: 'Code change that neither fixes a bug nor adds a feature',
          },
          { name: 'perf', description: 'Code change that improves performance' },
          { name: 'test', description: 'Adding missing tests or correcting existing tests' },
          { name: 'build', description: 'Changes that affect the build system or dependencies' },
          { name: 'ci', description: 'Changes to CI configuration files and scripts' },
          { name: 'chore', description: "Other changes that don't modify src or test files" },
          { name: 'revert', description: 'Reverts a previous commit' },
        ],
        examples: [
          'feat(auth): add login functionality',
          'fix(api): resolve null pointer exception',
          'docs(readme): update installation instructions',
          'refactor(utils): simplify date formatting',
        ],
      },
      references: [
        'https://www.conventionalcommits.org/',
        'https://chris.beams.io/posts/git-commit/',
      ],
    },
  });
});
