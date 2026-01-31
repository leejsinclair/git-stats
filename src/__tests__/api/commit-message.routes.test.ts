import express from 'express';
import * as fs from 'fs-extra';
import request from 'supertest';

import { commitMessageRouter } from '../../api/routes/commit-message';

const app = express();
app.use(express.json());
app.use('/api/commit-messages', commitMessageRouter);

// Mock fs-extra
jest.mock('fs-extra');
const mockFs = fs as any;

// Mock CommitMessageAnalyzerService
jest.mock('../../services/commit-message-analyzer.service');

describe('Commit Message API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/commit-messages/analyze', () => {
    it('should validate required repoPath field', async () => {
      const response = await request(app)
        .post('/api/commit-messages/analyze')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 404 for non-existent repository path', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/commit-messages/analyze')
        .send({
          repoPath: '/non/existent/path',
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should analyze repository when valid path is provided', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.writeJson.mockResolvedValue(undefined);

      const mockAnalysisResult = {
        totalCommits: 10,
        validCommits: 8,
        invalidCommits: 2,
      };

      const CommitMessageAnalyzerService = jest.requireMock(
        '../../services/commit-message-analyzer.service'
      ).CommitMessageAnalyzerService;
      CommitMessageAnalyzerService.mockImplementation(() => ({
        analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
      }));

      const response = await request(app)
        .post('/api/commit-messages/analyze')
        .send({
          repoPath: '/valid/repo/path',
          branch: 'main',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual(mockAnalysisResult);
      expect(response.body).toHaveProperty('savedTo');
    });

    it('should handle analysis with optional parameters', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.writeJson.mockResolvedValue(undefined);

      const mockAnalysisResult = {
        totalCommits: 5,
        validCommits: 5,
        invalidCommits: 0,
      };

      const CommitMessageAnalyzerService = jest.requireMock(
        '../../services/commit-message-analyzer.service'
      ).CommitMessageAnalyzerService;
      CommitMessageAnalyzerService.mockImplementation(() => ({
        analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
      }));

      const response = await request(app)
        .post('/api/commit-messages/analyze')
        .send({
          repoPath: '/valid/repo/path',
          branch: 'develop',
          limit: 100,
          since: '2024-01-01',
          until: '2024-12-31',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/commit-messages/analyze/repo/:repoName', () => {
    it('should return 404 for non-existent repository', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/commit-messages/analyze/repo/non-existent-repo')
        .send({})
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should analyze existing repository by name', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.writeJson.mockResolvedValue(undefined);

      const mockAnalysisResult = {
        totalCommits: 15,
        validCommits: 12,
        invalidCommits: 3,
      };

      const CommitMessageAnalyzerService = jest.requireMock(
        '../../services/commit-message-analyzer.service'
      ).CommitMessageAnalyzerService;
      CommitMessageAnalyzerService.mockImplementation(() => ({
        analyzeRepository: jest.fn().mockResolvedValue(mockAnalysisResult),
      }));

      const response = await request(app)
        .post('/api/commit-messages/analyze/repo/my-repo')
        .send({
          branch: 'main',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual(mockAnalysisResult);
      expect(response.body).toHaveProperty('savedTo');
    });
  });

  describe('GET /api/commit-messages/best-practices', () => {
    it('should return commit message best practices', async () => {
      const response = await request(app)
        .get('/api/commit-messages/best-practices')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('rules');
      expect(Array.isArray(response.body.data.rules)).toBe(true);
      expect(response.body.data.rules.length).toBeGreaterThan(0);
    });

    it('should include conventional commits in best practices', async () => {
      const response = await request(app).get('/api/commit-messages/best-practices').expect(200);

      expect(response.body.data).toHaveProperty('conventionalCommits');
      expect(response.body.data.conventionalCommits).toHaveProperty('types');
      expect(Array.isArray(response.body.data.conventionalCommits.types)).toBe(true);
    });
  });
});
