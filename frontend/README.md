# Git Statistics Dashboard - Frontend

A modern, well-tested React application for analyzing and visualizing Git repository statistics with comprehensive developer insights and commit message quality analysis.

## ✨ Features

- 📊 **Repository Dashboard** - Browse and analyze Git repositories with status tracking
- 👥 **Developer Analytics** - Comprehensive developer metrics across all repositories
- 📈 **Interactive Visualizations** - Charts and graphs using Recharts
- 💬 **Commit Message Quality** - Analyze commit messages against best practices
- 🎨 **Modern UI** - Dark mode support with Tailwind CSS
- ✅ **Well Tested** - 34 tests with high coverage
- 📚 **Component Library** - 22+ documented components in Storybook
- 🔄 **Real-time Updates** - Live status tracking for repository analysis

## 🚀 Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage

# Start Storybook (http://localhost:6006)
npm run storybook

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build Storybook
npm run build-storybook
```

## 🎯 Main Views

### Repositories View
- **Repository Cards**: Display repo name, status, commit count, and contributors
- **Status Filtering**: Filter by OK, Error, or Analyzing status
- **Detail View**: Click cards to see:
  - Summary statistics (commits, authors, code changes)
  - Commit trend chart (weekly activity)
  - Monthly activity chart
  - Author contribution breakdown
  - Recent commits table

### Developers View
- **Developer Cards**: Show developer metrics across all repositories
- **Detail View**: Comprehensive developer analysis including:
  - **Header**: Name, email, total commits
  - **Overview Stats**: Repositories, lines modified, active days, avg commits/day
  - **Quality Metrics**: Documentation ratio, test ratio with color-coded thresholds
  - **Commit Message Compliance**: Pass rate, average score, common issues
  - **Commit Size Distribution**: Tiny/Small/Medium/Large/Huge breakdown
  - **Commit Type Distribution**: Features, fixes, docs, refactoring analysis
  - **Working Hours Analysis**: Peak hours and work pattern health indicators
  - **Activity Charts**: Day of week, repository contributions, hourly patterns
  - **Recent Commits**: Detailed commit history with validation

## 📦 Component Library

All components are documented in Storybook with multiple variants:

### Chart Components
- **AuthorContributionChart** - Pie chart showing contributor distribution
- **CommitTrendChart** - Line chart for commit trends over time
- **MonthlyActivityChart** - Bar chart for monthly commit activity

### Developer Components (13 components)
- **DeveloperCard** - Summary card with key metrics
- **DeveloperDetailView** - Main orchestrator component
- **DevelopersList** - Grid of developer cards

**Detail View Sub-components:**
- **DeveloperHeader** - Name, email, and commit count
- **OverviewStatsCard** - Repository count, lines modified, active days
- **QualityMetricCard** - Reusable metric with thresholds (documentation, test coverage)
- **MessageComplianceCard** - Commit message quality metrics
- **CommitSizeChart** - Bar chart of commit size distribution
- **CommitTypeChart** - Horizontal bar chart of commit types
- **WorkingHoursChart** - Pie chart with work pattern analysis
- **ActivityChartsGrid** - Grid of 4 activity visualizations
- **RecentCommitsTable** - Paginated table with commit details

### Layout Components
- **Header** - Application header with title and actions
- **ViewTabs** - Tab navigation (Repositories/Developers)

### Modal Components
- **ScanModal** - Folder scanning configuration
- **CleanupModal** - Old file cleanup interface

### Repository Components
- **RepoCard** - Repository summary card
- **ReposList** - Grid of repository cards
- **RepoDetailView** - Detailed repository analysis

## 🧪 Testing

### Test Suite Overview
✅ **34 tests passing** across 5 test suites:

1. **API Tests** (11 tests)
   - All API client methods
   - Success and error handling
   - Request/response validation

2. **Component Tests** (23 tests)
   - RepoCard (8 tests): Display, status, errors
   - DeveloperCard (7 tests): Metrics, compliance, display
   - Header (4 tests): Rendering, button interactions
   - ViewTabs (4 tests): Tab switching, active state

### Testing Stack
- **Vitest**: Fast test runner optimized for Vite
- **React Testing Library**: Component testing utilities
- **Happy DOM**: Lightweight DOM for tests
- **User Event**: User interaction simulation

### Writing Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Test Utilities
- **Custom Render**: `src/test/test-utils.tsx` - Render with providers
- **Setup**: `src/test/setup.ts` - Global test configuration
- **Mocks**: API mocking with `vi.fn()` and `vi.mock()`

## 📚 Storybook

Interactive component documentation at http://localhost:6006

### Available Stories (35+ variants)

**Developer Components:**
- DeveloperCard: 4 variants (default, high activity, compliance)
- DeveloperHeader: 3 variants (default, high activity, new developer)
- CommitSizeChart: 4 variants (balanced, small commits, large commits, tiny)
- CommitTypeChart: 4 variants (balanced, high bugs, low bugs, feature-focused)
- WorkingHoursChart: 4 variants (healthy, burnout risk, flexible, evening)
- QualityMetricCard: 6 variants (doc/test coverage excellent/good/poor)
- OverviewStatsCard: 4 variants (typical, highly active, new, multi-project)
- MessageComplianceCard: 4 variants (excellent, good, poor, no issues)
- ActivityChartsGrid: 3 variants (typical week, weekend warrior, single repo)
- RecentCommitsTable: 5 variants (well-formatted, issues, limited, mixed, single)

**Other Components:**
- Header: 2 variants
- ViewTabs: 2 variants
- RepoCard: 3 variants
- ScanModal: 3 variants
- CleanupModal: 3 variants

### Creating New Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Category/MyComponent',
  component: MyComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Hello World',
  },
};
```

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type safety and developer experience
- **Vite 6** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling with dark mode
- **Recharts** - Composable charting library
- **Vitest** - Fast unit testing framework
- **React Testing Library** - User-centric component testing
- **Storybook 10** - Component development and documentation
- **ESLint + Prettier** - Code quality and formatting

## 📁 Project Structure

```
frontend/
├── .storybook/              # Storybook configuration
│   ├── main.ts
│   ├── preview.tsx
│   └── README.md
├── public/                  # Static assets
├── src/
│   ├── __tests__/           # Test files
│   │   ├── api.test.ts
│   │   ├── DeveloperCard.test.tsx
│   │   ├── Header.test.tsx
│   │   ├── RepoCard.test.tsx
│   │   └── ViewTabs.test.tsx
│   ├── components/
│   │   ├── charts/          # Chart components (3)
│   │   ├── developers/      # Developer components (13)
│   │   │   ├── detail/      # Detail view sub-components (9)
│   │   │   ├── DeveloperCard.tsx
│   │   │   ├── DeveloperDetailView.tsx
│   │   │   └── DevelopersList.tsx
│   │   ├── layout/          # Layout components (2)
│   │   ├── modals/          # Modal components (2)
│   │   └── repositories/    # Repository components (3)
│   ├── test/                # Test utilities
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── api.ts               # API client
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── TESTING.md               # Testing documentation
├── package.json
└── README.md                # This file
```

## 🎨 Styling

### Tailwind Configuration
- **Dark Mode**: Class-based dark mode support
- **Custom Colors**: Extended palette for charts and status indicators
- **Responsive Design**: Mobile-first approach
- **Typography**: Optimized font scales

### Component Patterns
- Consistent card styling with shadows and borders
- Color-coded status indicators (green/yellow/red)
- Threshold-based metric colors
- Accessible color contrasts

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `vitest.config.ts` - Test configuration (extends Vite)
- `tsconfig.json` - TypeScript base config
- `tsconfig.app.json` - App TypeScript config
- `tsconfig.node.json` - Node TypeScript config
- `eslint.config.js` - ESLint rules
- `tailwind.config.js` - Tailwind customization
- `postcss.config.js` - PostCSS plugins

## 📖 API Client

The `api.ts` file provides type-safe methods for all backend endpoints:

```typescript
import { api } from './api';

// Get all metadata
const metadata = await api.getMetadata();

// Analyze repository
const result = await api.analyzeLocal({ 
  repoPath: '/path/to/repo',
  branch: 'main' 
});

// Get developer stats
const developers = await api.getDevelopers();
```

All methods include proper error handling and TypeScript typing.

## 🚀 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Charts**: Recharts with performance optimizations
- **Efficient Re-renders**: React.memo and useMemo for expensive computations
- **Small Bundle**: Tree-shaking and minification in production

## 🎯 Best Practices

1. **Type Safety**: All components have full TypeScript types
2. **Testing**: High test coverage with meaningful tests
3. **Documentation**: JSDoc comments on all components
4. **Accessibility**: Semantic HTML and ARIA labels
5. **Code Quality**: ESLint and Prettier enforcement
6. **Component Design**: Small, focused, reusable components
7. **Story-Driven Development**: All components have Storybook stories

## 🤝 Contributing

1. Create Storybook stories for new components
2. Write tests for new functionality
3. Follow existing code patterns
4. Run linting and formatting before committing
5. Ensure all tests pass
6. Update documentation as needed

## 📄 Additional Documentation

- **Testing Guide**: [TESTING.md](TESTING.md)
- **Storybook Guide**: [.storybook/README.md](.storybook/README.md)
- **Main Project README**: [../README.md](../README.md)
