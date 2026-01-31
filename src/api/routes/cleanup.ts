import { Router } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();

/**
 * POST /api/cleanup/old-files
 * Deletes old analysis files that are no longer referenced in metadata.json.
 * Helps clean up disk space by removing outdated analysis results.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with count and list of deleted files
 */
router.post('/old-files', async (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'output');

    // Read metadata to get current files
    const metadataPath = path.join(dataDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    const currentFiles = new Set<string>();
    for (const repo of metadata.repositories || []) {
      if (repo.outputFile) {
        const filename = repo.outputFile.split('/').pop();
        currentFiles.add(filename);
      }
    }

    // Get all analysis files
    const allFiles = await fs.readdir(dataDir);
    const analysisFiles = allFiles.filter(
      f => f.includes('-analysis-') && f.endsWith('.json') && f !== 'metadata.json'
    );

    // Find old files (not in metadata)
    const oldFiles = analysisFiles.filter(f => !currentFiles.has(f));

    // Delete old files
    const deletedFiles: string[] = [];
    for (const file of oldFiles) {
      const filePath = path.join(dataDir, file);
      await fs.unlink(filePath);
      deletedFiles.push(file);
    }

    res.json({
      success: true,
      data: {
        deletedCount: deletedFiles.length,
        deletedFiles,
        message: `Deleted ${deletedFiles.length} old analysis file(s)`,
      },
    });
  } catch (error: any) {
    console.error('Error cleaning up old files:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clean up old files',
    });
  }
});

/**
 * GET /api/cleanup/old-files
 * Previews old analysis files that would be deleted without actually deleting them.
 * Useful for reviewing what cleanup will do before executing it.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with details of old files
 */
router.get('/old-files', async (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'output');

    // Read metadata to get current files
    const metadataPath = path.join(dataDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    const currentFiles = new Set<string>();
    for (const repo of metadata.repositories || []) {
      if (repo.outputFile) {
        const filename = repo.outputFile.split('/').pop();
        currentFiles.add(filename);
      }
    }

    // Get all analysis files
    const allFiles = await fs.readdir(dataDir);
    const analysisFiles = allFiles.filter(
      f => f.includes('-analysis-') && f.endsWith('.json') && f !== 'metadata.json'
    );

    // Find old files (not in metadata)
    const oldFiles = analysisFiles.filter(f => !currentFiles.has(f));

    // Get file sizes
    const fileDetails = await Promise.all(
      oldFiles.map(async file => {
        const filePath = path.join(dataDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
        };
      })
    );

    res.json({
      success: true,
      data: {
        oldFilesCount: oldFiles.length,
        currentFilesCount: currentFiles.size,
        totalFilesCount: analysisFiles.length,
        oldFiles: fileDetails,
      },
    });
  } catch (error: any) {
    console.error('Error previewing old files:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to preview old files',
    });
  }
});

export default router;
