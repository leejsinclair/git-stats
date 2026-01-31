# Git Developer View

A comprehensive developer analytics view that aggregates metrics across all analyzed repositories.

## Features

### 📊 Developer Metrics

**Commit Activity:**
- Total commits across all repositories
- Active days and average commits per day
- Activity by day of week and hour of day
- Repository contributions

**Code Changes (Refactoring):**
- Lines added
- Lines removed  
- Lines modified (total code changes)
- Files changed
- Per-repository breakdown

**Commit Message Compliance:**
- Average message score (0-100)
- Pass rate percentage
- Issues by type (errors, warnings, info)
- Top violations with descriptions
- Integration with commit message analyzer

### 🎯 What is Measured

#### 1. Refactoring Metrics
- **Lines Modified**: Sum of lines added and deleted, showing total code change volume
- **Lines Added**: New code contributions
- **Lines Removed**: Code cleanup and deletions
- **Files Changed**: Number of files touched across all commits
- **Per-Repo Activity**: Breakdown of contributions by repository

#### 2. Commit Message Compliance
- **Pass Rate**: Percentage of commits meeting quality standards (score ≥70, no errors)
- **Average Score**: Mean quality score across all commits (0-100)
- **Common Issues**: Most frequent commit message violations
- **Issue Breakdown**: Categorized by severity (errors, warnings, info)

Based on generally accepted best practices:
- Subject line length (≤50 chars ideal, ≤72 hard limit)
- Proper capitalization
- No period at end
- Conventional Commits format support
- Body formatting
- Avoiding generic messages

#### 3. Activity Patterns
- **Active Days**: Number of unique days with commits
- **Commits Per Day**: Average activity rate
- **Day of Week**: Identify peak working days
- **Hour of Day**: Identify peak working hours
- **Recent Activity**: Trend over last 30 days

## API Endpoints

### Get All Developer Statistics
```http
GET /api/developers/stats
```

Returns aggregated statistics for all developers across all analyzed repositories.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDevelopers": 1,
    "developers": [
      {
        "name": "Developer Name",
        "email": "developer@example.com",
        "metrics": {
          "totalCommits": 130,
          "linesAdded": 114815,
          "linesRemoved": 15916,
          "linesModified": 130731,
          "filesChanged": 740,
          "repositories": ["repo1", "repo2"],
          "firstCommit": "2025-03-23T09:45:26+10:00",
          "lastCommit": "2026-01-03T14:49:39+10:00"
        },
        "messageCompliance": {
          "totalCommits": 9,
          "averageScore": 87.78,
          "passRate": 66.67,
          "issuesByType": {
            "errors": 3,
            "warnings": 4,
            "info": 2
          },
          "topIssues": [...]
        },
        "activity": {
          "totalDays": 288,
          "activeDays": 5,
          "averageCommitsPerDay": 0.45,
          "commitsByDayOfWeek": {...},
          "commitsByHour": {...},
          "recentActivity": [...]
        }
      }
    ],
    "generatedAt": "2026-01-03T15:00:00Z"
  }
}
```

### Get Specific Developer Statistics
```http
GET /api/developers/stats/:developerName
```

## Frontend Components

### DeveloperCard
Summary card showing:
- Developer name and email
- Total commits and repositories
- Lines modified breakdown
- Message compliance metrics (if available)
- Quick stats overview

### DeveloperDetailView
Comprehensive developer analysis with:
- **Header Section**: Key metrics summary
- **Compliance Section**: Commit message quality analysis
- **Activity Charts**:
  - Commits by day of week (bar chart)
  - Repository contributions (pie chart)
  - Commits by hour (bar chart)
  - Recent activity trend (line chart)
- **Recent Commits**: Detailed list with hash, date, message, repo, and changes

## Usage

### Viewing Developer Statistics

1. **Start the application:**
   ```bash
   npm run dev:all
   ```

2. **Navigate to Developers tab** in the dashboard

3. **Click on a developer card** to view detailed analytics

### Generating Data

The developer view aggregates data from:
1. **Git analysis files** (`git-stats-analysis-*.json`)
2. **Commit message analysis files** (`*-commit-messages-*.json`)

To generate comprehensive developer data:

```bash
# 1. Analyze repositories for commit stats
curl -X POST http://localhost:3000/api/git/analyze/folder \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/home/user/projects", "saveResults": true}'

# 2. Analyze commit messages for compliance
curl -X POST http://localhost:3000/api/commit-messages/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoPath": "/path/to/repo", "limit": 100}'

# 3. View developer stats
curl http://localhost:3000/api/developers/stats
```

## Data Sources

The developer aggregation service processes:

### Git Analysis Files
- `data/output/git-stats-analysis-*.json`
- Contains commit history with authors, changes, dates
- Provides metrics for code changes and activity

### Commit Message Analysis Files
- `data/output/*-commit-messages-*.json`
- Contains commit message quality scores
- Provides compliance metrics

## Metrics Interpretation

### Lines Modified
- **High values** indicate significant code changes (could be refactoring, new features, or cleanup)
- Compare with lines added/removed ratio to understand the nature of changes
- Refactoring typically shows balanced additions and deletions

### Commit Message Compliance
- **Pass Rate ≥80%**: Excellent commit message hygiene
- **Pass Rate 60-79%**: Good, but room for improvement
- **Pass Rate <60%**: Needs attention to commit message quality

### Activity Patterns
- **Consistent daily activity**: Regular contributor
- **Burst patterns**: Project-based work
- **Weekend activity**: Dedication or poor work-life balance indicator

## Future Enhancements

- [ ] Team collaboration metrics
- [ ] Code review participation
- [ ] Pull request statistics
- [ ] Language/technology breakdown
- [ ] Time-based trend analysis
- [ ] Developer comparison views
- [ ] Export reports to PDF/CSV
- [ ] Custom date range filtering
- [ ] Merge conflict resolution statistics
