import { Request, Response, Router } from 'express';

import { DeveloperAggregationService } from '../../services/developer-aggregation.service';

export const developerRouter = Router();
const developerService = new DeveloperAggregationService();

// Get aggregated developer statistics
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

// Get stats for a specific developer
developerRouter.get('/stats/:developerName', async (req: Request, res: Response) => {
  try {
    const { developerName } = req.params;
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
