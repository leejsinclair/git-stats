import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { gitRouter } from './api/routes/git';
import { MetadataService } from './services/metadata.service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from data directory
app.use('/data', express.static(path.join(process.cwd(), 'data')));

// Routes
app.use('/api/git', gitRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize metadata service and clear stuck 'analyzing' statuses
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
