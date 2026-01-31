import express from 'express';
import request from 'supertest';

import { developerRouter } from '../../api/routes/developer';

const app = express();
app.use(express.json());
app.use('/api/developers', developerRouter);

describe('Developer API Routes', () => {
  describe('GET /api/developers/stats', () => {
    it('should return developer statistics', async () => {
      const response = await request(app)
        .get('/api/developers/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalDevelopers');
      expect(response.body.data).toHaveProperty('developers');
      expect(response.body.data).toHaveProperty('generatedAt');
      expect(Array.isArray(response.body.data.developers)).toBe(true);
    });

    it('should include all required developer fields', async () => {
      const response = await request(app).get('/api/developers/stats').expect(200);

      if (response.body.data.developers.length > 0) {
        const developer = response.body.data.developers[0];

        // Basic info
        expect(developer).toHaveProperty('name');
        expect(developer).toHaveProperty('email');

        // Metrics
        expect(developer).toHaveProperty('metrics');
        expect(developer.metrics).toHaveProperty('totalCommits');
        expect(developer.metrics).toHaveProperty('linesAdded');
        expect(developer.metrics).toHaveProperty('linesRemoved');
        expect(developer.metrics).toHaveProperty('repositories');
        expect(developer.metrics).toHaveProperty('documentationRatio');
        expect(developer.metrics).toHaveProperty('testRatio');

        // Activity
        expect(developer).toHaveProperty('activity');
        expect(developer.activity).toHaveProperty('totalDays');
        expect(developer.activity).toHaveProperty('activeDays');

        // New metrics
        expect(developer).toHaveProperty('commitSizeDistribution');
        expect(developer).toHaveProperty('commitTypeDistribution');
        expect(developer).toHaveProperty('workingHoursAnalysis');
      }
    });

    it('should have valid documentation and test ratios', async () => {
      const response = await request(app).get('/api/developers/stats').expect(200);

      if (response.body.data.developers.length > 0) {
        const developer = response.body.data.developers[0];

        expect(developer.metrics.documentationRatio).toBeGreaterThanOrEqual(0);
        expect(developer.metrics.documentationRatio).toBeLessThanOrEqual(100);
        expect(developer.metrics.testRatio).toBeGreaterThanOrEqual(0);
        expect(developer.metrics.testRatio).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('GET /api/developers/stats/:developerName', () => {
    it('should return 404 for non-existent developer', async () => {
      const response = await request(app)
        .get('/api/developers/stats/NonExistentDeveloper')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
