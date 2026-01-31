# Commit Message Analyzer Module

This module analyzes git commit messages for conformance to generally accepted best practices, including support for Conventional Commits.

## Features

- ✅ **Best Practice Validation**: Checks commit messages against industry-standard guidelines
- ✅ **Conventional Commits Support**: Full validation of Conventional Commits specification
- ✅ **Detailed Scoring**: Each commit receives a score (0-100) based on compliance
- ✅ **Issue Categorization**: Issues classified as errors, warnings, or info
- ✅ **Repository-wide Reports**: Analyze entire repositories with aggregate statistics
- ✅ **Rule Summary**: Overview of most common violations

## Rules Checked

### General Best Practices

1. **Subject Line**
   - Should not be empty
   - Maximum length: 50 characters (warning), 72 characters (error)
   - Minimum length: 10 characters
   - Should not end with a period
   - Should start with a capital letter (unless using Conventional Commits)
   - Avoid generic messages (e.g., "fix", "update", "wip")

2. **Body**
   - Should be separated from subject by a blank line
   - Line length should not exceed 72 characters

### Conventional Commits

When using Conventional Commits format (`type(scope): description`):

- **Type**: Must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Type Case**: Must be lowercase
- **Scope**: Optional, but if present must be lowercase
- **Description**: Must not be empty, should start with lowercase

## API Endpoints

### 1. Analyze Commit Messages (Local Repository)

```http
POST /api/commit-messages/analyze
Content-Type: application/json

{
  "repoPath": "/path/to/repository",
  "branch": "main",
  "limit": 100,
  "since": "2024-01-01",
  "until": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCommits": 150,
    "analyzedCommits": 100,
    "overallScore": 78.5,
    "passRate": 82.0,
    "commits": [...],
    "rulesSummary": [...]
  },
  "savedTo": "/path/to/output.json"
}
```

### 2. Analyze Previously Cloned Repository

```http
POST /api/commit-messages/analyze/repo/:repoName
Content-Type: application/json

{
  "branch": "main",
  "limit": 50
}
```

### 3. Get Best Practices Information

```http
GET /api/commit-messages/best-practices
```

Returns comprehensive information about commit message best practices and Conventional Commits specification.

## Usage Examples

### Analyze a Local Repository

```bash
curl -X POST http://localhost:3000/api/commit-messages/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/home/user/my-project",
    "branch": "main",
    "limit": 100
  }'
```

### Analyze with Date Range

```bash
curl -X POST http://localhost:3000/api/commit-messages/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/home/user/my-project",
    "since": "2024-01-01",
    "until": "2024-12-31"
  }'
```

### Get Best Practices Guide

```bash
curl http://localhost:3000/api/commit-messages/best-practices
```

## Response Structure

### CommitMessageAnalysis

Each analyzed commit includes:

```typescript
{
  hash: string;          // Commit SHA
  author: string;        // Author name
  date: string;          // Commit date
  message: string;       // Full commit message
  subject: string;       // Subject line
  body: string;          // Message body
  score: number;         // Score 0-100
  passed: boolean;       // Whether commit meets standards (score >= 70, no errors)
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
    line?: number;
  }>;
}
```

### CommitMessageReport

The full report includes:

```typescript
{
  totalCommits: number;        // Total commits in repository
  analyzedCommits: number;     // Number of commits analyzed
  overallScore: number;        // Average score across all commits
  passRate: number;            // Percentage of commits that passed
  commits: CommitMessageAnalysis[];  // Individual commit analyses
  rulesSummary: Array<{
    rule: string;
    violations: number;
    description: string;
  }>;
}
```

## Scoring System

- **Starting Score**: 100 points
- **Error**: -20 points
- **Warning**: -10 points
- **Info**: -5 points
- **Minimum Score**: 0 points

A commit is considered "passed" if:
1. Score is >= 70
2. No errors are present

## Conventional Commits Examples

### Good Examples ✅

```
feat(auth): add user login functionality
fix(api): resolve null pointer exception in user endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting logic
perf(database): optimize query performance
```

### Bad Examples ❌

```
Feat(auth): add login          # Type should be lowercase
feat(AUTH): add login          # Scope should be lowercase
feat: Add login                # Description should start lowercase
feat():add login               # Empty scope, no space after colon
feat add login                 # Missing colon
```

## Integration with Frontend

The module can be integrated with the existing frontend by adding a new view for commit message analysis. The API returns data in a format similar to the git stats analysis.

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Git Commit Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)

## Future Enhancements

- Custom rule configuration
- Ignore patterns (e.g., merge commits)
- Integration with git hooks for pre-commit validation
- Trend analysis over time
- Team-specific best practices
- AI-powered commit message quality assessment
