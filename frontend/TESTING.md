# Frontend Testing Guide

This document describes the testing setup and best practices for the Git Statistics Dashboard frontend.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Current Test Coverage

✅ **34 tests passing** across 5 test suites:

- **API Tests** (11 tests): All API client methods with success and error cases
- **RepoCard Tests** (8 tests): Repository display, status handling, error states
- **DeveloperCard Tests** (7 tests): Developer stats, metrics, compliance display
- **Header Tests** (4 tests): UI rendering and button interactions
- **ViewTabs Tests** (4 tests): Tab switching and active state

## Testing Stack

- **Vitest**: Fast test runner optimized for Vite projects
- **React Testing Library**: Testing utilities for React components
- **Happy DOM**: Lightweight DOM implementation for tests
- **User Event**: User interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

Tests are located in `src/__tests__/` directory:

```
src/
├── __tests__/
│   ├── api.test.ts              # API client tests
│   ├── RepoCard.test.tsx        # RepoCard component tests
│   ├── DeveloperCard.test.tsx   # DeveloperCard component tests
│   ├── Header.test.tsx          # Header component tests
│   └── ViewTabs.test.tsx        # ViewTabs component tests
├── test/
│   ├── setup.ts                 # Test setup and global config
│   └── test-utils.tsx           # Custom render utilities
```

## Writing Component Tests

### Basic Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  
  render(<Button onClick={onClick} />);
  
  await user.click(screen.getByRole('button'));
  
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### Testing Props and State

```typescript
it('should display correct data from props', () => {
  const mockData = {
    name: 'John Doe',
    email: 'john@example.com',
  };
  
  render(<UserCard user={mockData} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

## Writing API Tests

### Mocking Fetch

```typescript
import { vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

function createFetchResponse<T>(data: T, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response;
}

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      createFetchResponse({ data: mockData })
    );

    const result = await api.getData();

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/data');
    expect(result).toEqual(mockData);
  });
});
```

## Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad**: Testing internal state
```typescript
expect(component.state.count).toBe(1);
```

✅ **Good**: Testing what users see
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:

```typescript
// Best - accessible to screen readers
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/username/i)

// Good - visible to users
screen.getByText(/welcome/i)

// Avoid - implementation details
screen.getByTestId('submit-button')
```

### 3. Mock External Dependencies

```typescript
// Mock API calls
vi.mock('../api', () => ({
  api: {
    getMetadata: vi.fn().mockResolvedValue(mockData),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
```

### 4. Keep Tests Focused

Each test should verify one specific behavior:

```typescript
// One assertion per test (when possible)
it('should display user name', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

it('should display user email', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

### 5. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically done in setup.ts
afterEach(() => {
  cleanup();
});
```

## Coverage Goals

Aim for:
- **80%+ overall coverage**
- **90%+ for critical business logic**
- **100% for utility functions**

Check coverage with:
```bash
npm run test:coverage
```

## Common Testing Patterns

### Testing Conditional Rendering

```typescript
it('should show error message when error exists', () => {
  const errorRepo = { ...mockRepo, error: 'Failed to analyze' };
  render(<RepoCard repo={errorRepo} />);
  
  expect(screen.getByText('Failed to analyze')).toBeInTheDocument();
});

it('should not show error message when no error', () => {
  render(<RepoCard repo={mockRepo} />);
  
  expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
});
```

### Testing Lists

```typescript
it('should render all items', () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  render(<ItemList items={items} />);
  
  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```typescript
it('should load data on mount', async () => {
  render(<DataComponent />);
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Debugging Tests

### View Rendered Output

```typescript
import { screen } from '@testing-library/react';

it('should render', () => {
  const { container } = render(<MyComponent />);
  
  // Print the DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### Check Available Queries

```typescript
import { screen } from '@testing-library/react';

screen.logTestingPlaygroundURL();
// Opens browser with suggestions for better queries
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
