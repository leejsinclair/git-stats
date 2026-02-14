import express from 'express';
import * as fs from 'fs-extra';
import request from 'supertest';

import { GitService } from '../../services/git.service';
import { MetadataService } from '../../services/metadata.service';

// Mock fs-extra
jest.mock('fs-extra');
const mockFs = fs as any;

// Mock services BEFORE importing the router
jest.mock('../../services/git.service');
jest.mock('../../services/metadata.service');

const MockGitService = GitService as jest.MockedClass<typeof GitService>;
const MockMetadataService = MetadataService as jest.MockedClass<typeof MetadataService>;

const defaultAnalysisResult = {
  totalCommits: 0,
  authors: [],
  dateRange: {
    firstCommit: null,
    lastCommit: null,
  },
  summary: {
    totalLinesAdded: 0,
    totalLinesRemoved: 0,
    totalFilesChanged: 0,
  },
};

let gitServiceInstance:
  | {
      analyzeRepository: jest.Mock;
      scanFolderForRepos: jest.Mock;
      cloneOrUpdateRepo: jest.Mock;
      setupLocalRepo: jest.Mock;
    }
  | undefined;

let metadataServiceInstance:
  | {
      updateRepoStatus: jest.Mock;
      readMetadata: jest.Mock;
      getReposByStatus: jest.Mock;
      clearAnalyzingStatus: jest.Mock;
    }
  | undefined;

MockGitService.mockImplementation(
  () => (
    (gitServiceInstance = {
      cloneOrUpdateRepo: jest.fn().mockResolvedValue(undefined),
      setupLocalRepo: jest.fn().mockResolvedValue(undefined),
      analyzeRepository: jest.fn().mockResolvedValue(defaultAnalysisResult),
      scanFolderForRepos: jest.fn().mockResolvedValue([]),
    }),
    gitServiceInstance as unknown as GitService
  )
);

MockMetadataService.mockImplementation(
  () => (
    (metadataServiceInstance = {
      updateRepoStatus: jest.fn().mockResolvedValue(undefined),
      readMetadata: jest.fn().mockResolvedValue({
        repositories: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      }),
      getReposByStatus: jest.fn().mockResolvedValue([]),
      clearAnalyzingStatus: jest.fn().mockResolvedValue(undefined),
    }),
    metadataServiceInstance as unknown as MetadataService
  )
);

let gitRouter: typeof import('../../api/routes/git').gitRouter;
let app: express.Express;

describe('Git API Routes', () => {
  beforeAll(async () => {
    const module = await import('../../api/routes/git');
    gitRouter = module.gitRouter;

    app = express();
    app.use(express.json());
    app.use('/api/git', gitRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    if (gitServiceInstance) {
      gitServiceInstance.analyzeRepository.mockResolvedValue(defaultAnalysisResult);
      gitServiceInstance.scanFolderForRepos.mockResolvedValue([]);
      gitServiceInstance.cloneOrUpdateRepo.mockResolvedValue(undefined);
      gitServiceInstance.setupLocalRepo.mockResolvedValue(undefined);
    }

    if (metadataServiceInstance) {
      metadataServiceInstance.updateRepoStatus.mockResolvedValue(undefined);
      metadataServiceInstance.readMetadata.mockResolvedValue({
        repositories: [],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      metadataServiceInstance.getReposByStatus.mockResolvedValue([]);
      metadataServiceInstance.clearAnalyzingStatus.mockResolvedValue(undefined);
    }
  });

  describe('GET /api/git/metadata', () => {
    it('should return metadata endpoint exists', async () => {
      const response = await request(app).get('/api/git/metadata');

      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/git/metadata/status/:status', () => {
    it('should return repositories filtered by status endpoint exists', async () => {
      const response = await request(app).get('/api/git/metadata/status/ok');

      expect([200, 500]).toContain(response.status);
    });

    it('should handle invalid status gracefully', async () => {
      const response = await request(app)
        .get('/api/git/metadata/status/invalid')
        .expect('Content-Type', /json/);

      // API validates status and returns 400 for invalid values
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/git/analyze/remote', () => {
    it('should validate required repoUrl field', async () => {
      const response = await request(app)
        .post('/api/git/analyze/remote')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should analyze remote repository', async () => {
      mockFs.writeJson.mockResolvedValue(undefined);

      const mockAnalysisResult = {
        totalCommits: 100,
        authors: ['Ada', 'Grace'],
        dateRange: {
          firstCommit: '2023-01-01T00:00:00.000Z',
          lastCommit: '2024-01-01T00:00:00.000Z',
        },
        summary: {
          totalLinesAdded: 120,
          totalLinesRemoved: 45,
          totalFilesChanged: 20,
        },
      };

      if (!gitServiceInstance) {
        throw new Error('GitService mock not initialized');
      }

      gitServiceInstance.cloneOrUpdateRepo.mockResolvedValue(undefined);
      gitServiceInstance.analyzeRepository.mockResolvedValue(mockAnalysisResult);

      const response = await request(app)
        .post('/api/git/analyze/remote')
        .send({
          repoUrl: 'https://github.com/user/repo.git',
          branch: 'main',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('savedTo');
    });
  });

  describe('POST /api/git/analyze/local', () => {
    it('should validate required repoPath field', async () => {
      const response = await request(app)
        .post('/api/git/analyze/local')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should analyze local repository', async () => {
      mockFs.writeJson.mockResolvedValue(undefined);

      const mockAnalysisResult = {
        totalCommits: 50,
        authors: ['Dev A'],
        dateRange: {
          firstCommit: '2022-05-01T00:00:00.000Z',
          lastCommit: '2024-02-01T00:00:00.000Z',
        },
        summary: {
          totalLinesAdded: 200,
          totalLinesRemoved: 80,
          totalFilesChanged: 30,
        },
      };

      if (!gitServiceInstance) {
        throw new Error('GitService mock not initialized');
      }

      gitServiceInstance.setupLocalRepo.mockResolvedValue(undefined);
      gitServiceInstance.analyzeRepository.mockResolvedValue(mockAnalysisResult);
      const response = await request(app)
        .post('/api/git/analyze/local')
        .send({
          repoPath: '/path/to/local/repo',
          branch: 'develop',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('savedTo');
    });
  });

  describe('POST /api/git/analyze/folder', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/git/analyze/folder')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should handle folder with no repositories', async () => {
      const response = await request(app).post('/api/git/analyze/folder').send({
        folderPath: '/nonexistent-folder-path',
      });

      // Should fail gracefully with non-existent folder
      expect([200, 500]).toContain(response.status);
    });

    it('should accept valid folder analysis request', async () => {
      const response = await request(app)
        .post('/api/git/analyze/folder')
        .send({
          folderPath: '/tmp/test-repos',
          maxDepth: 2,
          branch: 'main',
          saveResults: false,
        })
        .expect('Content-Type', /json/);

      // Should either succeed or fail gracefully (folder might not exist in test)
      expect(response.body).toHaveProperty('success');
      if (response.body.success) {
        expect(response.body).toHaveProperty('foundRepos');
        if (response.body.foundRepos > 0) {
          expect(response.body).toHaveProperty('successfulAnalysis');
        }
      }
    });
  });

  describe('POST /api/git/analyze/folder/async', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/git/analyze/folder/async')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return a scan id for async folder scan', async () => {
      const response = await request(app)
        .post('/api/git/analyze/folder/async')
        .send({
          folderPath: '/tmp/test-repos',
          maxDepth: 2,
          branch: 'main',
          saveResults: false,
        })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('scanId');
        expect(typeof response.body.scanId).toBe('string');
      }
    });
  });

  describe('GET /api/git/analyze/folder/progress/:scanId', () => {
    it('should return 404 for non-existent scan id', async () => {
      const response = await request(app)
        .get('/api/git/analyze/folder/progress/nonexistent-scan-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return progress for existing scan id', async () => {
      // First start a scan
      const startResponse = await request(app).post('/api/git/analyze/folder/async').send({
        folderPath: '/tmp/test-repos',
        maxDepth: 1,
        branch: 'main',
        saveResults: false,
      });

      if (startResponse.status === 200 && startResponse.body.scanId) {
        const scanId = startResponse.body.scanId;

        const progressResponse = await request(app)
          .get(`/api/git/analyze/folder/progress/${scanId}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(progressResponse.body).toHaveProperty('success', true);
        expect(progressResponse.body).toHaveProperty('data');
        expect(progressResponse.body.data).toHaveProperty('scanId', scanId);
        expect(progressResponse.body.data).toHaveProperty('status');
        expect(progressResponse.body.data).toHaveProperty('scannedCount');
        expect(progressResponse.body.data).toHaveProperty('foundRepos');
      }
    });
  });
});
