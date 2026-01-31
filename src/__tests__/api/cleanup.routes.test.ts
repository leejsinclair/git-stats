import express from 'express';
import request from 'supertest';

import cleanupRouter from '../../api/routes/cleanup';

const app = express();
app.use(express.json());
app.use('/api/cleanup', cleanupRouter);

describe('Cleanup API Routes', () => {
  describe('GET /api/cleanup/old-files', () => {
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
  });

  describe('POST /api/cleanup/old-files', () => {
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
  });
});
