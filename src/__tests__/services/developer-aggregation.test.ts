import { jest } from '@jest/globals';
import * as fs from 'fs/promises';

import { DeveloperAggregationService } from '../../services/developer-aggregation.service';

// Mock fs/promises before importing the service
jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

/** Minimal analysis file content representing one commit by one developer. */
const MOCK_ANALYSIS = {
  recentCommits: [
    {
      hash: 'abc123',
      author: 'Alice Dev',
      email: 'alice@example.com',
      date: '2024-01-15T10:00:00Z',
      message: 'feat: add new feature',
      linesAdded: 50,
      linesRemoved: 10,
      filesChanged: ['src/feature.ts', 'src/__tests__/feature.test.ts'],
    },
    {
      hash: 'def456',
      author: 'Alice Dev',
      email: 'alice@example.com',
      date: '2024-01-16T14:00:00Z',
      message: 'fix: correct bug',
      linesAdded: 5,
      linesRemoved: 3,
      filesChanged: ['src/bug.ts'],
    },
  ],
};

const MOCK_METADATA = {
  repositories: [
    {
      repoName: 'my-repo',
      outputFile: '/data/output/my-repo-analysis-2024.json',
      status: 'ok',
    },
  ],
};

describe('DeveloperAggregationService', () => {
  let service: DeveloperAggregationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeveloperAggregationService();
  });

  describe('aggregateDevelopers', () => {
    beforeEach(() => {
      // metadata.json resolves successfully
      mockFs.readFile.mockImplementation((filePath: any) => {
        const p = String(filePath);
        if (p.endsWith('metadata.json')) {
          return Promise.resolve(JSON.stringify(MOCK_METADATA)) as any;
        }
        return Promise.resolve(JSON.stringify(MOCK_ANALYSIS)) as any;
      });
    });

    it('should return a developer report', async () => {
      const report = await service.aggregateDevelopers();

      expect(report).toHaveProperty('totalDevelopers');
      expect(report).toHaveProperty('developers');
      expect(report).toHaveProperty('generatedAt');
      expect(typeof report.totalDevelopers).toBe('number');
      expect(Array.isArray(report.developers)).toBe(true);
    });

    it('should include documentation and test ratios', async () => {
      const report = await service.aggregateDevelopers();

      if (report.developers.length > 0) {
        const developer = report.developers[0];

        expect(developer.metrics).toHaveProperty('documentationRatio');
        expect(developer.metrics).toHaveProperty('testRatio');
        expect(typeof developer.metrics.documentationRatio).toBe('number');
        expect(typeof developer.metrics.testRatio).toBe('number');

        // Ratios should be between 0 and 100
        expect(developer.metrics.documentationRatio).toBeGreaterThanOrEqual(0);
        expect(developer.metrics.documentationRatio).toBeLessThanOrEqual(100);
        expect(developer.metrics.testRatio).toBeGreaterThanOrEqual(0);
        expect(developer.metrics.testRatio).toBeLessThanOrEqual(100);
      }
    });

    it('should sort developers by commit count', async () => {
      const report = await service.aggregateDevelopers();

      if (report.developers.length > 1) {
        for (let i = 0; i < report.developers.length - 1; i++) {
          expect(report.developers[i].metrics.totalCommits).toBeGreaterThanOrEqual(
            report.developers[i + 1].metrics.totalCommits
          );
        }
      }
    });

    it('should calculate commit size distribution', async () => {
      const report = await service.aggregateDevelopers();

      if (report.developers.length > 0) {
        const developer = report.developers[0];
        const dist = developer.commitSizeDistribution;

        expect(dist).toHaveProperty('tiny');
        expect(dist).toHaveProperty('small');
        expect(dist).toHaveProperty('medium');
        expect(dist).toHaveProperty('large');
        expect(dist).toHaveProperty('huge');
        expect(dist).toHaveProperty('averageLinesPerCommit');
        expect(dist).toHaveProperty('medianLinesPerCommit');

        // Total should match recent commits (limited to 50), not all commits
        const total = dist.tiny + dist.small + dist.medium + dist.large + dist.huge;
        expect(total).toBe(developer.recentCommits.length);
      }
    });

    it('should calculate working hours analysis', async () => {
      const report = await service.aggregateDevelopers();

      if (report.developers.length > 0) {
        const developer = report.developers[0];
        const hours = developer.workingHoursAnalysis;

        expect(hours).toHaveProperty('lateNightCommits');
        expect(hours).toHaveProperty('weekendCommits');
        expect(hours).toHaveProperty('businessHoursCommits');
        expect(hours).toHaveProperty('lateNightPercentage');
        expect(hours).toHaveProperty('weekendPercentage');
        expect(hours).toHaveProperty('preferredWorkingHours');

        expect(typeof hours.lateNightPercentage).toBe('number');
        expect(typeof hours.weekendPercentage).toBe('number');
        expect(['morning', 'afternoon', 'evening', 'night', 'unknown']).toContain(
          hours.preferredWorkingHours
        );
      }
    });

    it('should fall back to readdir when metadata.json is missing', async () => {
      mockFs.readFile.mockImplementation((filePath: any) => {
        const p = String(filePath);
        if (p.endsWith('metadata.json')) {
          return Promise.reject(new Error('ENOENT')) as any;
        }
        return Promise.resolve(JSON.stringify(MOCK_ANALYSIS)) as any;
      });
      mockFs.readdir.mockResolvedValue(['my-repo-analysis-2024.json'] as any);

      const report = await service.aggregateDevelopers();
      expect(report).toHaveProperty('developers');
      expect(Array.isArray(report.developers)).toBe(true);
    });
  });

  describe('getDeveloperStats', () => {
    beforeEach(() => {
      mockFs.readFile.mockImplementation((filePath: any) => {
        const p = String(filePath);
        if (p.endsWith('metadata.json')) {
          return Promise.resolve(JSON.stringify(MOCK_METADATA)) as any;
        }
        return Promise.resolve(JSON.stringify(MOCK_ANALYSIS)) as any;
      });
    });

    it('should return null for non-existent developer', async () => {
      const stats = await service.getDeveloperStats('NonExistentDeveloper');
      expect(stats).toBeNull();
    });

    it('should return stats for existing developer', async () => {
      const report = await service.aggregateDevelopers();

      if (report.developers.length > 0) {
        const firstDev = report.developers[0];
        const stats = await service.getDeveloperStats(firstDev.name);

        expect(stats).not.toBeNull();
        expect(stats?.name).toBe(firstDev.name);
        expect(stats?.email).toBe(firstDev.email);
      }
    });
  });
});
