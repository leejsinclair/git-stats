# Testing Guide

This project uses **Jest** as the testing framework with **Supertest** for API testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
  __tests__/
    api/                    # API route tests
      git.routes.test.ts
      developer.routes.test.ts
      cleanup.routes.test.ts
    services/               # Service layer tests
      commit-message-analyzer.test.ts
      developer-aggregation.test.ts
```

## Test Coverage

The test suite covers:

### API Routes
- **Git Routes** (`/api/git/*`)
  - Metadata retrieval
  - Status filtering
  - Folder analysis
  - Request validation

- **Developer Routes** (`/api/developers/*`)
  - Developer statistics aggregation
  - Individual developer lookup
  - Metrics validation (documentation ratio, test ratio)

- **Cleanup Routes** (`/api/cleanup/*`)
  - Old file preview
  - File deletion
  - Count validation

### Services
- **CommitMessageAnalyzerService**
  - Conventional commit format validation
  - Subject line rules (length, capitalization, period)
  - Scoring system
  - Issue detection

- **DeveloperAggregationService**
  - Developer data aggregation
  - Documentation and test ratio calculation
  - Commit size distribution
  - Working hours analysis
  - Sorting by commit count

## Writing Tests

### API Route Tests
```typescript
import express from 'express';
import request from 'supertest';
import { myRouter } from '../../api/routes/my-route';

const app = express();
app.use(express.json());
app.use('/api/my-route', myRouter);

describe('My API Route', () => {
  it('should return data', async () => {
    const response = await request(app)
      .get('/api/my-route')
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
  });
});
```

### Service Tests
```typescript
import { MyService } from '../../services/my-service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should process data correctly', () => {
    const result = service.processData('input');
    expect(result).toBe('expected');
  });
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests are automatically run on:
- Pre-commit hook (via Husky)
- Pull requests
- Main branch pushes

## Troubleshooting

### Tests timing out
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 15000 // 15 seconds
```

### Module not found errors
Ensure all dependencies are installed:
```bash
npm install
```

### Coverage not generated
Run with explicit coverage flag:
```bash
npm run test:coverage
```
