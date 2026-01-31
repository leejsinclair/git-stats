import cors from 'cors';
import express from 'express';
import path from 'path';

import cleanupRouter from './api/routes/cleanup';
import { commitMessageRouter } from './api/routes/commit-message';
import { developerRouter } from './api/routes/developer';
import { gitRouter } from './api/routes/git';
import { config } from './config';
import { MetadataService } from './services/metadata.service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from data directory
app.use('/data', express.static(path.join(process.cwd(), 'data')));

// Routes
app.use('/api/git', gitRouter);
app.use('/api/commit-messages', commitMessageRouter);
app.use('/api/developers', developerRouter);
app.use('/api/cleanup', cleanupRouter);

/**
 * GET /health
 * Health check endpoint to verify the server is running.
 *
 * @returns JSON response with server status and timestamp
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Initialize the server by clearing any stuck 'analyzing' statuses.
 * This ensures that repositories that were being analyzed when the server crashed
 * are marked with an error status instead of staying in 'analyzing' state.
 */
const initializeServer = async () => {
  const metadataService = new MetadataService();
  await metadataService.clearAnalyzingStatus();
  console.log('Cleared any stuck analyzing statuses from previous sessions');
};

// Start server
const PORT = config.port || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await initializeServer();
});

export default app;
