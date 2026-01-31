import { DeveloperAggregationService } from '../../services/developer-aggregation.service';

describe('DeveloperAggregationService', () => {
  let service: DeveloperAggregationService;

  beforeEach(() => {
    service = new DeveloperAggregationService();
  });

  describe('aggregateDevelopers', () => {
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

        // Total should match commit count
        const total = dist.tiny + dist.small + dist.medium + dist.large + dist.huge;
        expect(total).toBe(developer.metrics.totalCommits);
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
  });

  describe('getDeveloperStats', () => {
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
