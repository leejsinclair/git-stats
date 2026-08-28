import { jest } from '@jest/globals';
import express from 'express';
import * as fs from 'fs/promises';
import request from 'supertest';

import cleanupRouter from '../../api/routes/cleanup';

// Mock fs/promises before any imports that use it
jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

const app = express();
app.use(express.json());
app.use('/api/cleanup', cleanupRouter);

const MOCK_METADATA = {
  repositories: [
    {
      repoName: 'current-repo',
      outputFile: '/data/output/current-repo-analysis-2024.json',
      status: 'ok',
    },
  ],
};

describe('Cleanup API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cleanup/old-files', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(MOCK_METADATA) as any);
      // Two files: one current, one old
      mockFs.readdir.mockResolvedValue([
        'current-repo-analysis-2024.json',
        'old-repo-analysis-2023.json',
      ] as any);
      mockFs.stat.mockResolvedValue({
        size: 1024,
        mtime: new Date('2023-06-01'),
      } as any);
    });

    it('should preview old files to be deleted', async () => {
      const response = await request(app)
        .get('/api/cleanup/old-files')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('oldFilesCount');
      expect(response.body.data).toHaveProperty('currentFilesCount');
      expect(response.body.data).toHaveProperty('totalFilesCount');
      expect(response.body.data).toHaveProperty('oldFiles');

      expect(typeof response.body.data.oldFilesCount).toBe('number');
      expect(typeof response.body.data.currentFilesCount).toBe('number');
      expect(Array.isArray(response.body.data.oldFiles)).toBe(true);
    });

    it('should calculate correct totals', async () => {
      const response = await request(app).get('/api/cleanup/old-files').expect(200);

      const { oldFilesCount, currentFilesCount, totalFilesCount } = response.body.data;
      expect(totalFilesCount).toBe(oldFilesCount + currentFilesCount);
    });

    it('should identify old files not in metadata', async () => {
      const response = await request(app).get('/api/cleanup/old-files').expect(200);

      // old-repo-analysis-2023.json is not in metadata, so it should be listed as old
      expect(response.body.data.oldFilesCount).toBe(1);
      expect(response.body.data.currentFilesCount).toBe(1);
    });

    it('should return 500 when metadata cannot be read', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file') as never);

      const response = await request(app).get('/api/cleanup/old-files').expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/cleanup/old-files', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(MOCK_METADATA) as any);
      mockFs.readdir.mockResolvedValue([
        'current-repo-analysis-2024.json',
        'old-repo-analysis-2023.json',
      ] as any);
      mockFs.unlink.mockResolvedValue(undefined as any);
    });

    it('should return cleanup results', async () => {
      const response = await request(app)
        .post('/api/cleanup/old-files')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('deletedCount');
      expect(response.body.data).toHaveProperty('deletedFiles');
      expect(response.body.data).toHaveProperty('message');

      expect(typeof response.body.data.deletedCount).toBe('number');
      expect(Array.isArray(response.body.data.deletedFiles)).toBe(true);
      expect(response.body.data.deletedFiles.length).toBe(response.body.data.deletedCount);
    });

    it('should delete only old files not referenced in metadata', async () => {
      const response = await request(app).post('/api/cleanup/old-files').expect(200);

      expect(response.body.data.deletedCount).toBe(1);
      expect(response.body.data.deletedFiles).toContain('old-repo-analysis-2023.json');
      expect(mockFs.unlink).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when metadata cannot be read', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file') as never);

      const response = await request(app).post('/api/cleanup/old-files').expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
