# Analysis Aggregation Structure

## Overview
The repository analysis has been restructured to handle large repositories efficiently by aggregating commit data into weekly, monthly, and yearly statistics.

## New Analysis Structure

### Top Level
```typescript
{
  repoName: string,
  branch: string,
  totalCommits: number,
  authors: string[],
  dateRange: {
    firstCommit: string | null,
    lastCommit: string | null
  },
  summary: {
    totalLinesAdded: number,
    totalLinesRemoved: number,
    totalFilesChanged: number,
    authorContribution: Record<string, number>
  },
  aggregations: {
    yearly: YearlyStats[],
    monthly: MonthlyStats[],
    weekly: WeeklyStats[]
  },
  recentCommits: CommitStats[]  // Only last 100 commits
}
```

### Weekly Stats
Commits grouped by ISO week (Monday to Sunday):
```typescript
{
  weekStart: "2025-12-30",  // ISO date (Monday)
  weekNumber: 1,             // ISO week number
  year: 2026,
  commits: 15,
  linesAdded: 523,
  linesRemoved: 142,
  authors: ["Alice", "Bob"],
  filesChanged: 23,
  commitHashes: ["abc123...", ...]
}
```

### Monthly Stats
Aggregated by calendar month, includes nested weekly stats:
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

### Yearly Stats
Aggregated by calendar year, includes nested monthly stats:
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

## Benefits

### Scalability
- **Large repos**: Handle repositories with thousands of commits efficiently
- **File size**: Analysis files remain manageable even for years of history
- **Query speed**: Quickly access high-level statistics without processing all commits

### Hierarchical Analysis
- **Drill-down**: Navigate from yearly → monthly → weekly → individual commits
- **Trends**: Easily identify patterns across different time scales
- **Comparisons**: Compare activity across weeks, months, or years

### Memory Efficiency
- **Recent commits only**: Full detail kept for last 100 commits
- **Historical data**: Older commits aggregated into time periods
- **Reduced redundancy**: No duplication of common information

## Example Use Cases

### View yearly activity
```javascript
const yearlyStats = analysis.aggregations.yearly;
yearlyStats.forEach(year => {
  console.log(`${year.year}: ${year.commits} commits by ${year.authors.length} authors`);
});
```

### Find most active month
```javascript
const monthlyStats = analysis.aggregations.monthly;
const mostActive = monthlyStats.reduce((max, month) => 
  month.commits > max.commits ? month : max
);
console.log(`Most active: ${mostActive.month} with ${mostActive.commits} commits`);
```

### Analyze weekly patterns
```javascript
const weeklyStats = analysis.aggregations.weekly;
const avgCommitsPerWeek = weeklyStats.reduce((sum, week) => 
  sum + week.commits, 0) / weeklyStats.length;
```

## Migration Notes

### Old Format (Deprecated)
- All commits stored in flat array
- Daily commit frequency in simple object
- No hierarchical aggregation

### New Format
- Only recent 100 commits stored in detail
- Hierarchical weekly/monthly/yearly aggregations
- Nested structure: years contain months, months contain weeks
- Each level maintains its own statistics
