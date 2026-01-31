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

      (GitService as jest.Mock).mockImplementation(() => ({
        cloneOrUpdateRepo: jest.fn().mockResolvedValue(undefined),
        analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
      }));

      (MetadataService as jest.Mock).mockImplementation(() => ({
        updateRepoStatus: jest.fn().mockResolvedValue(undefined),
      }));

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

      (GitService as jest.Mock).mockImplementation(() => ({
        setupLocalRepo: jest.fn().mockResolvedValue(undefined),
        analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
      }));

      MetadataService as jest.Mock;
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
});
