import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

import { developerRouter } from '../../api/routes/developer';
import { DeveloperAggregationService } from '../../services/developer-aggregation.service';

jest.mock('../../services/developer-aggregation.service');

const MockDeveloperAggregationService = DeveloperAggregationService as jest.MockedClass<
  typeof DeveloperAggregationService
>;

const app = express();
app.use(express.json());
app.use('/api/developers', developerRouter);

const MOCK_DEVELOPER = {
  name: 'Alice Dev',
  email: 'alice@example.com',
  metrics: {
    totalCommits: 42,
    linesAdded: 1500,
    linesRemoved: 300,
    linesModified: 1800,
    repositories: ['repo-a', 'repo-b'],
    documentationRatio: 15.5,
    testRatio: 22.3,
  },
  activity: {
    totalDays: 90,
    activeDays: 60,
    firstCommit: '2024-01-01T00:00:00Z',
    lastCommit: '2024-03-31T00:00:00Z',
    commitsPerDay: 0.7,
  },
  commitSizeDistribution: {
    tiny: 10,
    small: 15,
    medium: 12,
    large: 4,
    huge: 1,
    averageLinesPerCommit: 42,
    medianLinesPerCommit: 30,
  },
  commitTypeDistribution: {
    feat: 20,
    fix: 10,
    docs: 5,
    style: 2,
    refactor: 3,
    perf: 1,
    test: 1,
    build: 0,
    ci: 0,
    chore: 0,
    other: 0,
  },
  workingHoursAnalysis: {
    lateNightCommits: 3,
    weekendCommits: 5,
    businessHoursCommits: 34,
    lateNightPercentage: 7.1,
    weekendPercentage: 11.9,
    preferredWorkingHours: 'afternoon' as const,
    hourlyDistribution: new Array(24).fill(0),
  },
  messageCompliance: {
    totalMessages: 42,
    validMessages: 38,
    averageScore: 82,
    passPercentage: 90.5,
  },
  recentCommits: [],
};

const MOCK_REPORT = {
  totalDevelopers: 1,
  developers: [MOCK_DEVELOPER],
  generatedAt: new Date().toISOString(),
};

describe('Developer API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockDeveloperAggregationService.prototype.aggregateDevelopers.mockResolvedValue(
      MOCK_REPORT as any
    );
    MockDeveloperAggregationService.prototype.getDeveloperStats.mockImplementation(
      async (name: string) => {
        if (name === MOCK_DEVELOPER.name) return MOCK_DEVELOPER as any;
        return null;
      }
    );
  });

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

    it('should return 500 when service throws', async () => {
      MockDeveloperAggregationService.prototype.aggregateDevelopers.mockRejectedValue(
        new Error('Service failure') as never
      );

      const response = await request(app).get('/api/developers/stats').expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
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

    it('should return stats for an existing developer', async () => {
      const response = await request(app)
        .get(`/api/developers/stats/${encodeURIComponent(MOCK_DEVELOPER.name)}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', MOCK_DEVELOPER.name);
      expect(response.body.data).toHaveProperty('email', MOCK_DEVELOPER.email);
    });
  });
});
