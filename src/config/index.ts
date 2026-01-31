import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Application configuration loaded from environment variables.
 * Provides paths for data storage, repository clones, and server settings.
 */
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dataDir: process.env.DATA_DIR || path.join(process.cwd(), 'data'),
  reposDir: process.env.REPOS_DIR || path.join(process.cwd(), 'data', 'repos'),
  outputDir: process.env.OUTPUT_DIR || path.join(process.cwd(), 'data', 'output'),
  maxConcurrentClones: parseInt(process.env.MAX_CONCURRENT_CLONES || '3', 10),
};

/**
 * Type definition for application configuration.
 */
export type Config = typeof config;
