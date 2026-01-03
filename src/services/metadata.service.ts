import * as fs from 'fs-extra';
import * as path from 'path';
import { config } from '../config';

export type AnalysisStatus = 'ok' | 'error' | 'analyzing';

export interface RepoMetadata {
  repoPath: string;
  repoName: string;
  status: AnalysisStatus;
  lastAnalyzed: string;
  outputFile?: string;
  error?: string;
  branch?: string;
}

export interface Metadata {
  repositories: RepoMetadata[];
  lastUpdated: string;
}

export class MetadataService {
  private metadataPath: string;

  constructor() {
    this.metadataPath = path.join(config.outputDir, 'metadata.json');
  }

  async readMetadata(): Promise<Metadata> {
    try {
      if (await fs.pathExists(this.metadataPath)) {
        const data = await fs.readJson(this.metadataPath);
        return data;
      }
      return {
        repositories: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error reading metadata:', error);
      return {
        repositories: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

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
    const existingIndex = metadata.repositories.findIndex(
      r => r.repoPath === repoPath
    );

    const repoMetadata: RepoMetadata = {
      repoPath,
      repoName: options.repoName || path.basename(repoPath),
      status,
      lastAnalyzed: new Date().toISOString(),
      ...(options.outputFile && { outputFile: options.outputFile }),
      ...(options.error && { error: options.error }),
      ...(options.branch && { branch: options.branch })
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

  async getRepoStatus(repoPath: string): Promise<RepoMetadata | null> {
    const metadata = await this.readMetadata();
    return metadata.repositories.find(r => r.repoPath === repoPath) || null;
  }

  async getAllRepos(): Promise<RepoMetadata[]> {
    const metadata = await this.readMetadata();
    return metadata.repositories;
  }

  async getReposByStatus(status: AnalysisStatus): Promise<RepoMetadata[]> {
    const metadata = await this.readMetadata();
    return metadata.repositories.filter(r => r.status === status);
  }

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
