import { Request, Response, Router } from 'express';

import { DeveloperAggregationService } from '../../services/developer-aggregation.service';

export const developerRouter = Router();
const developerService = new DeveloperAggregationService();

/**
 * GET /api/developers/stats
 * Returns aggregated statistics for all developers across all analyzed repositories.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with developer statistics report
 */
developerRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const report = await developerService.aggregateDevelopers();

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error getting developer stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get developer statistics',
    });
  }
});

/**
 * GET /api/developers/stats/:developerName
 * Returns statistics for a specific developer.
 *
 * @param req - Express request object with developerName parameter
 * @param res - Express response object
 * @returns JSON response with developer statistics or 404 if not found
 */
developerRouter.get('/stats/:developerName', async (req: Request, res: Response) => {
  try {
    const developerNameParam = req.params.developerName;
    const developerName = Array.isArray(developerNameParam)
      ? developerNameParam[0]
      : developerNameParam;

    if (!developerName) {
      return res.status(400).json({
        success: false,
        error: 'Developer name is required',
      });
    }

    const stats = await developerService.getDeveloperStats(developerName);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: `Developer not found: ${developerName}`,
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting developer stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get developer statistics',
    });
  }
});
