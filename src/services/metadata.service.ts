import * as fs from 'fs-extra';
import * as path from 'path';

import { config } from '../config';

/**
 * Status of a repository analysis.
 */
export type AnalysisStatus = 'ok' | 'error' | 'analyzing';

/**
 * Metadata for a single analyzed repository.
 */
export interface RepoMetadata {
  repoPath: string;
  repoName: string;
  status: AnalysisStatus;
  lastAnalyzed: string;
  outputFile?: string;
  error?: string;
  branch?: string;
}

/**
 * Complete metadata containing all repository information.
 */
export interface Metadata {
  repositories: RepoMetadata[];
  lastUpdated: string;
}

/**
 * Service for managing repository analysis metadata.
 * Tracks analysis status, errors, and output file locations for all analyzed repositories.
 */
export class MetadataService {
  private metadataPath: string;

  constructor() {
    this.metadataPath = path.join(config.outputDir, 'metadata.json');
  }

  /**
   * Reads metadata from the metadata.json file.
   *
   * @returns Metadata object, or an empty structure if file doesn't exist
   */
  async readMetadata(): Promise<Metadata> {
    try {
      if (await fs.pathExists(this.metadataPath)) {
        const data = await fs.readJson(this.metadataPath);
        return data;
      }
      return {
        repositories: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error reading metadata:', error);
      return {
        repositories: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Writes metadata to the metadata.json file.
   * Automatically updates the lastUpdated timestamp.
   *
   * @param metadata - Metadata object to write
   * @throws {Error} If write operation fails
   */
  async writeMetadata(metadata: Metadata): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.metadataPath));
      metadata.lastUpdated = new Date().toISOString();
      await fs.writeJson(this.metadataPath, metadata, { spaces: 2 });
    } catch (error) {
      console.error('Error writing metadata:', error);
      throw error;
    }
  }

  /**
   * Updates or creates metadata for a repository.
   *
   * @param repoPath - Absolute path to the repository
   * @param status - Analysis status (ok, error, or analyzing)
   * @param options - Additional metadata including repoName, outputFile, error, and branch
   */
  async updateRepoStatus(
    repoPath: string,
    status: AnalysisStatus,
    options: {
      repoName?: string;
      outputFile?: string;
      error?: string;
      branch?: string;
    } = {}
  ): Promise<void> {
    const metadata = await this.readMetadata();

    // Find existing entry or create new one
    const existingIndex = metadata.repositories.findIndex(r => r.repoPath === repoPath);

    const repoMetadata: RepoMetadata = {
      repoPath,
      repoName: options.repoName || path.basename(repoPath),
      status,
      lastAnalyzed: new Date().toISOString(),
      ...(options.outputFile && { outputFile: options.outputFile }),
      ...(options.error && { error: options.error }),
      ...(options.branch && { branch: options.branch }),
    };

    if (existingIndex >= 0) {
      // Update existing entry
      metadata.repositories[existingIndex] = repoMetadata;
    } else {
      // Add new entry
      metadata.repositories.push(repoMetadata);
    }

    await this.writeMetadata(metadata);
  }

  /**
   * Retrieves metadata for a specific repository.
   *
   * @param repoPath - Absolute path to the repository
   * @returns Repository metadata or null if not found
   */
  async getRepoStatus(repoPath: string): Promise<RepoMetadata | null> {
    const metadata = await this.readMetadata();
    return metadata.repositories.find(r => r.repoPath === repoPath) || null;
  }

  /**
   * Retrieves metadata for all analyzed repositories.
   *
   * @returns Array of repository metadata
   */
  async getAllRepos(): Promise<RepoMetadata[]> {
    const metadata = await this.readMetadata();
    return metadata.repositories;
  }

  /**
   * Retrieves repositories filtered by analysis status.
   *
   * @param status - Analysis status to filter by
   * @returns Array of repository metadata matching the status
   */
  async getReposByStatus(status: AnalysisStatus): Promise<RepoMetadata[]> {
    const metadata = await this.readMetadata();
    return metadata.repositories.filter(r => r.status === status);
  }

  /**
   * Clears any repositories stuck in 'analyzing' status.
   * Sets them to 'error' status with an appropriate error message.
   * Useful for recovery after server crashes or restarts.
   */
  async clearAnalyzingStatus(): Promise<void> {
    const metadata = await this.readMetadata();

    // Set any 'analyzing' status to 'error' (in case of crashes)
    metadata.repositories.forEach(repo => {
      if (repo.status === 'analyzing') {
        repo.status = 'error';
        repo.error = 'Analysis interrupted or crashed';
      }
    });

    await this.writeMetadata(metadata);
  }
}
