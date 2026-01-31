# Git Statistics Dashboard

A comprehensive full-stack application for analyzing Git repositories, tracking developer metrics, and ensuring commit message quality. Features include hierarchical data aggregation, developer insights, and commit message compliance analysis.

## 🎯 Overview

This application provides deep insights into Git repositories by analyzing:
- **Repository Statistics**: Commit history, contributor analysis, code changes over time
- **Developer Metrics**: Individual developer contributions, coding patterns, and productivity
- **Commit Message Quality**: Automated analysis against best practices and Conventional Commits
- **Activity Trends**: Weekly, monthly, and yearly aggregations for long-term insights

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + simple-git
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Recharts
- **Testing**: Jest (backend) + Vitest (frontend) with 60 total tests
- **Documentation**: Storybook for component development
- **Code Quality**: ESLint + Prettier + Husky git hooks

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Option 2: Local Development

#### 1. Start Backend (Port 3000)
```bash
# From project root
npm install
npm run dev
```

#### 2. Start Frontend (Port 5173)
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

#### 3. Access Dashboard
Open http://localhost:5173 in your browser

## Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 📋 API Endpoints

### Git Repository Analysis
- `POST /api/git/analyze/local` - Analyze a local repository
  ```json
  { "repoPath": "/path/to/repo", "branch": "main", "saveResults": true }
  ```
- `POST /api/git/analyze/remote` - Clone and analyze a remote repository
  ```json
  { "repoUrl": "https://github.com/user/repo.git", "branch": "main" }
  ```
- `POST /api/git/analyze/folder` - Scan folder for repos and analyze all
  ```json
  { "folderPath": "/home/user/projects", "maxDepth": 3, "branch": "main" }
  ```

### Repository Metadata
- `GET /api/git/metadata` - Get all repository metadata
- `GET /api/git/metadata/status/:status` - Filter by status (ok/error/analyzing)
- `POST /api/git/metadata/clear-analyzing` - Clear stuck analyzing statuses
- `GET /api/git/info?repoPath=<path>` - Get repository information
- `GET /api/git/repos` - List available repositories

### Developer Analytics
- `GET /api/developers/stats` - Get all developer statistics across repositories
- `GET /api/developers/stats/:developerName` - Get specific developer's aggregated metrics

### Commit Message Analysis
- `POST /api/commit-messages/analyze` - Analyze commit messages for quality
  ```json
  { "repoPath": "/path/to/repo", "limit": 100, "since": "2024-01-01" }
  ```
- `POST /api/commit-messages/analyze/repo/:repoName` - Analyze previously cloned repo
- `GET /api/commit-messages/best-practices` - Get commit message best practices guide

### Cleanup
- `GET /api/cleanup/old-files` - Preview old analysis files
- `POST /api/cleanup/old-files` - Delete old analysis files

## ✨ Features

### 📊 Repository Dashboard
- View all analyzed repositories with status indicators
- Filter by status (OK, Error, Analyzing)
- Real-time analysis status updates
- Click cards to view detailed repository analysis
- Bulk folder scanning for multiple repositories

### 📈 Repository Analysis
- **Summary Statistics**: Total commits, contributors, lines added/removed, file changes
- **Commit Trends**: Weekly commit activity visualization over time
- **Monthly Activity**: Commits and active authors aggregated by month
- **Author Contributions**: Ranked contributors by commit count
- **Recent Commits**: Last 100 commits with full details and diffs
- **Hierarchical Aggregation**: Weekly → Monthly → Yearly statistics

### 👥 Developer Analytics
- **Aggregated Metrics**: Combined statistics across all repositories
- **Activity Patterns**: 
  - Commits by day of week and hour of day
  - Active days and average commits per day
  - Recent activity trends (last 30 days)
- **Code Metrics**:
  - Lines added, removed, and modified
  - Files changed across all projects
  - Per-repository contribution breakdown
- **Commit Message Quality**:
  - Average message score (0-100)
  - Pass rate percentage
  - Common issues and violations
  - Integration with commit message analyzer

### ✅ Commit Message Quality Analysis
- **Best Practice Validation**: Checks against industry-standard guidelines
- **Conventional Commits Support**: Full validation of type(scope): description format
- **Detailed Scoring**: Each commit scored 0-100 based on compliance
- **Issue Detection**:
  - Subject line length (≤50 ideal, ≤72 hard limit)
  - Proper capitalization and formatting
  - Body line length and separation
  - Generic message detection
- *🛠️ Development

### Backend Commands
```bash
npm run dev           # Development with hot reload
npm run build         # Build TypeScript
npm start             # Production start
npm test              # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Frontend Commands
```bash
cd frontend
npm run dev           # Development server (port 5173)
npm run build         # Production build
npm run preview       # Preview production build
npm test              # Run Vitest tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
npm run storybook     # Start Storybook (port 6006)
npm run build-storybook # Build static Storybook
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
```

## 📊 Data Analysis Structure

### Hierarchical Aggregation
Repository analysis uses a hierarchical structure for efficient data storage and querying:

**Weekly Stats** (ISO weeks, Monday to Sunday):
```typescript
{
  weekStart: "2025-12-30",  // ISO date (Monday)
  weekNumber: 1,
  year: 2026,
  commits: 15,
  linesAdded: 523,
  linesRemoved: 142,
  authors: ["Alice", "Bob"],
  filesChanged: 23
}
```

**Monthly Stats** (includes nested weekly stats):
```typescript
{
  month: "2026-01",
  commits: 47,
  linesAdded: 1542,
  linesRemoved: 389,
  authors: ["Alice", "Bob", "Charlie"],
  filesChanged: 67,
  weeks: [WeeklyStats[], ...]
}
```

**Yearly Stats** (includes nested monthly stats):
```typescript
{
  year: 2026,
  commits: 523,
  linesAdded: 15234,
  linesRemoved: 4521,
  authors: ["Alice", "Bob", "Charlie", "Dave"],
  filesChanged: 423,
  months: [MonthlyStats[], ...]
}
```

### Benefits
- **Scalability**: Handle repositories with thousands of commits
- **Query Speed**: Access high-level stats without processing all commits
- **Drill-down**: Navigate from yearly → monthly → weekly → individual commits
- **Memory Efficient**: Only last 100 commits stored in full detail

## 📝 Commit Message Analysis

### Validation Rules

**General Best Practices:**
1. Subject line should not be empty
2. Subject max length: 50 chars (warning), 72 chars (error)
3. Subject min length: 10 characters
4. Subject should not end with a period
5. Subject should start with capital letter (unless Conventional Commits)
6. Blank line between subject and body
7. Body lines should not exceed 72 characters
8. Avoid generic messages ("fix", "update", "wip")

**Conventional Commits Format:** `type(scope): description`
- **Valid types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Type and scope must be lowercase
- Description should start with lowercase
- Description must not be empty

### Scoring System
- Start at 100 points
- **Error**: -20 points (e.g., empty subject, invalid format)
- **Warning**: -10 points (e.g., subject too long, generic message)
- **Info**: -5 points (e.g., capitalization, body line length)
- **Passing threshold**: ≥70 points and no errors

## 🧪 Testing

### Test Coverage
- **Backend**: 26 Jest tests (API routes, services)
- **Frontend**: 34 Vitest tests (components, API client)
- **Total**: 60 tests across the full stack

### Git Hooks (Husky)
- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **pre-push**: Runs all tests (backend + frontend) before allowing push

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test

# All tests (via pre-push hook)
./.husky/pre-push
```

## 🎨 Component Development

### Storybook
Interactive component documentation and development environment:

```bash
cd frontend
npm run storybook  # Open http://localhost:6006
```

**Available Components:**
- **Charts**: AuthorContributionChart, CommitTrendChart, MonthlyActivityChart
- **Developers**: DeveloperCard, DeveloperDetailView, and 9 detail components
- **Layout**: Header, ViewTabs
- **Modals**: ScanModal, CleanupModal
- **Repositories**: RepoCard, ReposList, RepoDetailView

All components include JSDoc documentation, multiple story variants, and TypeScript prop definitions.

## 📂 Data Storage

```
data/
├── output/
│   ├── git-stats-analysis-*.json       # Repository analysis results
│   ├── *-commit-messages-*.json        # Commit message analysis
│   ├── badges-analysis-*.json          # Badge analysis
│   └── metadata.json                   # Repository metadata tracking
└── repos/                               # Cloned repositories
```

## 🔧 Code Quality

### Linting & Formatting
- **ESLint**: Configured for TypeScript with React best practices
- **Prettier**: Consistent code formatting (100 char width, single quotes)
- **Import Sorting**: Automatic import organization

### Pre-commit Hooks
Automatically runs on every commit:
1. ESLint with auto-fix on staged files
2. Prettier formatting on staged files
3. Only commits if all checks pass

### Configuration Files
- `.prettierrc` - Prettier configuration
- `eslint.config.js` - Backend ESLint config
- `frontend/eslint.config.js` - Frontend ESLint config  
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push test execution
- `package.json` - lint-staged configuration

## 📖 Documentation

- **Main README**: This file
- **Frontend README**: `frontend/README.md`
- **Testing Guide**: `frontend/TESTING.md`
- **Storybook Docs**: `frontend/.storybook/README.md`
- **API Documentation**: Included in this README (see API Endpoints section)
- **Component Docs**: Available in Storybook with JSDoc comments

## 🚢 Deployment

### Docker
The application is fully containerized:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Stop services
docker-compose down
```

**Services:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## 🤝 Contributing

1. Code must pass ESLint and Prettier checks
2. All tests must pass (enforced by pre-push hook)
3. New components should include Storybook stories
4. API changes should update this README
5. Follow existing code patterns and conventions

## 📄 License

MITPath": "/home/lee/projects",
    "maxDepth": 3,
    "branch": "main",
    "saveResults": true
  }'
```

Then refresh the dashboard to see results!

## Data Storage

- Analysis results: `data/output/*.json`
- Metadata tracking: `data/output/metadata.json`
- Cloned repos: `data/repos/`

## Development

### Backend
```bash
npm run dev      # Development with hot reload
npm run build    # Build TypeScript
npm start        # Production start
```

### Frontend
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```
# git-stats
