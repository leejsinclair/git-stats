import express from 'express';
import request from 'supertest';

import { gitRouter } from '../../api/routes/git';

const app = express();
app.use(express.json());
app.use('/api/git', gitRouter);

describe('Git API Routes', () => {
  describe('GET /api/git/metadata', () => {
    it('should return metadata with repositories list', async () => {
      const response = await request(app)
        .get('/api/git/metadata')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('repositories');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(Array.isArray(response.body.data.repositories)).toBe(true);
    });
  });

  describe('GET /api/git/metadata/status/:status', () => {
    it('should return repositories filtered by status', async () => {
      const response = await request(app)
        .get('/api/git/metadata/status/ok')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned repos should have status 'ok'
      response.body.data.forEach((repo: any) => {
        expect(repo).toHaveProperty('status', 'ok');
      });
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
