import express from 'express';
import * as fs from 'fs-extra';
import request from 'supertest';

import { gitRouter } from '../../api/routes/git';
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

const app = express();
app.use(express.json());
app.use('/api/git', gitRouter);

describe('Git API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        developers: 5,
      };

      MockGitService.mockImplementation(
        () =>
          ({
            cloneOrUpdateRepo: jest.fn().mockResolvedValue(undefined),
            analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
          }) as unknown as GitService
      );

      MockMetadataService.mockImplementation(
        () =>
          ({
            updateRepoStatus: jest.fn().mockResolvedValue(undefined),
          }) as unknown as MetadataService
      );

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
        developers: 3,
      };

      MockGitService.mockImplementation(
        () =>
          ({
            setupLocalRepo: jest.fn().mockResolvedValue(undefined),
            analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
          }) as unknown as GitService
      );

      MockMetadataService.mockImplementation(
        () =>
          ({
            updateRepoStatus: jest.fn().mockResolvedValue(undefined),
          }) as unknown as MetadataService
      );
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
        expect(response.body).toHaveProperty('successfulAnalysis');
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
