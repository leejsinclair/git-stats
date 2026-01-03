# Git Stats Dashboard

A full-stack application for analyzing and visualizing git repository statistics with aggregated weekly, monthly, and yearly insights.

## Architecture

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Recharts
- **Analysis**: Hierarchical aggregation (weekly/monthly/yearly)

## Quick Start

### 1. Start Backend (Port 3000)
```bash
# From project root
npm run dev
```

### 2. Start Frontend (Port 5173)
```bash
# In a new terminal
cd frontend
npm run dev
```

### 3. Access Dashboard
Open http://localhost:5173 in your browser

## API Endpoints

### Analysis
- `POST /api/git/analyze/local` - Analyze a local repository
- `POST /api/git/analyze/remote` - Clone and analyze a remote repository
- `POST /api/git/analyze/folder` - Scan folder for repos and analyze all

### Metadata
- `GET /api/git/metadata` - Get all repository metadata
- `GET /api/git/metadata/status/:status` - Filter by status (ok/error/analyzing)
- `POST /api/git/metadata/clear-analyzing` - Clear stuck analyzing statuses

### Repository Info
- `GET /api/git/info?repoPath=<path>` - Get repository information
- `GET /api/git/repos` - List available repositories

## Features

### Dashboard
- View all analyzed repositories
- Filter by status (OK, Error, Analyzing)
- Real-time status updates
- Click to view detailed analysis

### Repository Analysis
- **Summary Stats**: Total commits, contributors, lines added/removed
- **Commit Trend Chart**: Weekly commit activity over time
- **Monthly Activity**: Commits and active authors per month
- **Author Contributions**: Top contributors by commit count
- **Recent Commits**: Last 100 commits with details

### Scalability
- Handles repositories with thousands of commits
- Aggregated statistics (weekly/monthly/yearly)
- Only stores last 100 commits in full detail
- Efficient file sizes even for large repos

## Example: Scan All Projects

```bash
curl -X POST http://localhost:3000/api/git/analyze/folder \
  -H "Content-Type: application/json" \
  -d '{
    "folderPath": "/home/lee/projects",
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
