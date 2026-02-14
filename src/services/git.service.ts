import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';

/**
 * Represents statistics for a single commit.
 */
export interface CommitStats {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  insertions: number;
  deletions: number;
  files: number;
}

/**
 * Represents aggregated statistics for a single week.
 */
export interface WeeklyStats {
  weekStart: string; // ISO week start date (Monday)
  weekNumber: number;
  year: number;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  commitHashes: string[];
}

/**
 * Represents aggregated statistics for a single month.
 */
export interface MonthlyStats {
  month: string; // YYYY-MM format
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  weeks: WeeklyStats[];
}

/**
 * Represents aggregated statistics for a single year.
 */
export interface YearlyStats {
  year: number;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  months: MonthlyStats[];
}

/**
 * Complete analysis result for a Git repository.
 * Contains commit statistics, author information, and time-based aggregations.
 */
export interface RepoAnalysisResult {
  repoName: string;
  branch: string;
  totalCommits: number;
  authors: string[];
  dateRange: {
    firstCommit: string | null;
    lastCommit: string | null;
  };
  summary: {
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
    authorContribution: Record<string, number>;
  };
  aggregations: {
    yearly: YearlyStats[];
    monthly: MonthlyStats[];
    weekly: WeeklyStats[];
  };
  recentCommits: CommitStats[]; // Only last 100 commits in detail
  codeChurn: CodeChurnSummary;
}

/**
 * Represents churn statistics for a single file.
 */
export interface FileChurnStats {
  filePath: string;
  linesAdded: number;
  linesDeleted: number;
  totalChanges: number;
}

/**
 * Represents churn summary for a repository over a time window.
 */
export interface CodeChurnSummary {
  since: string;
  linesAdded: number;
  linesDeleted: number;
  totalChanges: number;
  files: FileChurnStats[];
}

/**
 * Service for analyzing Git repositories and extracting commit statistics.
 * Provides methods to clone, update, and analyze repositories.
 */
export class GitService {
  private static readonly IGNORED_CHURN_FILES = new Set([
    'package-lock.json',
    'npm-shrinkwrap.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'Pipfile.lock',
    'poetry.lock',
    'Cargo.lock',
    'go.sum',
    'Podfile.lock',
  ]);

  private static readonly IGNORED_CHURN_EXTENSIONS = new Set([
    '.md',
    '.markdown',
    '.mdown',
    '.adoc',
    '.asciidoc',
    '.asc',
  ]);

  private git: SimpleGit;

  constructor() {
    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };
    this.git = simpleGit(options);
  }

  /**
   * Sets up a local repository for analysis by verifying it exists and is a valid Git repository.
   *
   * @param localPath - Absolute path to the local repository
   * @throws {Error} If directory does not exist or is not a Git repository
   */
  async setupLocalRepo(localPath: string): Promise<void> {
    try {
      if (!(await fs.pathExists(localPath))) {
        throw new Error(`Directory does not exist: ${localPath}`);
      }

      // Check if it's a git repository
      const isRepo = await simpleGit(localPath).checkIsRepo();
      if (!isRepo) {
        throw new Error(`Not a git repository: ${localPath}`);
      }

      this.git = simpleGit(localPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup local repository: ${errorMessage}`);
    }
  }

  /**
   * Clones a remote repository or updates it if it already exists locally.
   *
   * @param repoUrl - URL of the remote Git repository
   * @param localPath - Local path where the repository should be cloned
   * @throws {Error} If clone or update operation fails
   */
  async cloneOrUpdateRepo(repoUrl: string, localPath: string): Promise<void> {
    try {
      if (await fs.pathExists(localPath)) {
        // Update existing repo
        this.git = simpleGit(localPath);
        await this.git.pull();
      } else {
        // Clone new repo
        await fs.ensureDir(path.dirname(localPath));
        await simpleGit().clone(repoUrl, localPath);
        this.git = simpleGit(localPath);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to clone/update repository: ${errorMessage}`);
    }
  }

  /**
   * Analyzes a Git repository and extracts comprehensive commit statistics.
   * Processes all commits and aggregates data by week, month, and year.
   *
   * @param repoPath - Absolute path to the Git repository
   * @param branch - Git branch to analyze (defaults to 'main')
   * @returns Repository analysis data including commits, authors, and aggregated stats
   * @throws {Error} If repository cannot be accessed or analyzed
   */
  async analyzeRepository(repoPath: string, branch: string = 'main'): Promise<RepoAnalysisResult> {
    try {
      this.git = simpleGit(repoPath);

      // Ensure the repo exists and is accessible
      if (!(await fs.pathExists(repoPath))) {
        throw new Error(`Repository not found at ${repoPath}`);
      }

      // Check if repository has any commits
      let log;
      try {
        log = await this.git.log({
          format: {
            hash: '%H',
            author: '%an',
            email: '%ae',
            date: '%aI',
            message: '%s',
          },
          '--stat': '4096', // Get diff stats
          '--no-merges': null, // Exclude merge commits
        });
      } catch (error) {
        // Repository has no commits yet
        const errorMessage = error instanceof Error ? error.message : '';
        if (
          errorMessage.includes('does not have any commits yet') ||
          errorMessage.includes('your current branch') ||
          errorMessage.includes('bad default revision')
        ) {
          return {
            repoName: path.basename(repoPath),
            branch,
            totalCommits: 0,
            authors: [],
            dateRange: {
              firstCommit: null,
              lastCommit: null,
            },
            summary: {
              totalLinesAdded: 0,
              totalLinesRemoved: 0,
              totalFilesChanged: 0,
              authorContribution: {},
            },
            aggregations: {
              yearly: [],
              monthly: [],
              weekly: [],
            },
            recentCommits: [],
            codeChurn: {
              since: '1 month ago',
              linesAdded: 0,
              linesDeleted: 0,
              totalChanges: 0,
              files: [],
            },
          };
        }
        throw error;
      }

      const commits: CommitStats[] = [];
      const authorSet = new Set<string>();
      let totalInsertions = 0;
      let totalDeletions = 0;
      let totalFiles = 0;

      // Process each commit
      for (const [index, commit] of log.all.entries()) {
        let stats = {
          insertions: 0,
          deletions: 0,
          files: 0,
        };

        // Skip diff for the first commit as it has no parent
        if (index < log.all.length - 1) {
          try {
            const diff = await this.git.diffSummary([`${commit.hash}~1..${commit.hash}`]);
            stats = {
              insertions: diff.insertions,
              deletions: diff.deletions,
              files: diff.files.length,
            };
          } catch (error) {
            console.warn(
              `Could not get diff for commit ${commit.hash}:`,
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        }

        // Update totals
        totalInsertions += stats.insertions;
        totalDeletions += stats.deletions;
        totalFiles += stats.files;

        // Add author to set
        authorSet.add(commit.author);

        commits.push({
          hash: commit.hash,
          author: commit.author,
          email: commit.email,
          date: commit.date,
          message: commit.message,
          ...stats,
        });
      }

      // Track author contributions
      const authorContribution: Record<string, number> = {};
      commits.forEach(commit => {
        authorContribution[commit.author] = (authorContribution[commit.author] || 0) + 1;
      });

      // Build aggregations
      const aggregations = this.buildAggregations(commits);

      let codeChurn: CodeChurnSummary = {
        since: '1 month ago',
        linesAdded: 0,
        linesDeleted: 0,
        totalChanges: 0,
        files: [],
      };

      try {
        const churnFiles = await this.getFileChurnSince(repoPath, codeChurn.since);
        const totals = churnFiles.reduce(
          (acc, file) => {
            acc.linesAdded += file.linesAdded;
            acc.linesDeleted += file.linesDeleted;
            acc.totalChanges += file.totalChanges;
            return acc;
          },
          { linesAdded: 0, linesDeleted: 0, totalChanges: 0 }
        );

        codeChurn = {
          since: codeChurn.since,
          linesAdded: totals.linesAdded,
          linesDeleted: totals.linesDeleted,
          totalChanges: totals.totalChanges,
          files: churnFiles,
        };
      } catch (error) {
        console.warn(
          'Failed to calculate file churn:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        repoName: path.basename(repoPath),
        branch,
        totalCommits: commits.length,
        authors: Array.from(authorSet),
        dateRange: {
          firstCommit: commits.length > 0 ? commits[commits.length - 1].date : null,
          lastCommit: commits.length > 0 ? commits[0].date : null,
        },
        summary: {
          totalLinesAdded: totalInsertions,
          totalLinesRemoved: totalDeletions,
          totalFilesChanged: totalFiles,
          authorContribution,
        },
        aggregations,
        recentCommits: commits.slice(0, 100), // Keep only last 100 commits in detail
        codeChurn,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in analyzeRepository:', error);
      throw new Error(`Repository analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Calculates file churn over a period using git numstat output.
   *
   * @param repoPath - Absolute path to the repository
   * @param since - Git log since filter (defaults to '1 month ago')
   * @returns Array of file churn stats (most changed first)
   */
  async getFileChurnSince(
    repoPath: string,
    since: string = '1 month ago'
  ): Promise<FileChurnStats[]> {
    if (!(await fs.pathExists(repoPath))) {
      throw new Error(`Repository not found at ${repoPath}`);
    }

    this.git = simpleGit(repoPath);

    const output = await this.git.raw(['log', '--numstat', '--pretty=format:', `--since=${since}`]);

    const churnMap = new Map<string, { added: number; deleted: number }>();

    const shouldIgnoreFile = (filePath: string): boolean => {
      const baseName = path.basename(filePath);
      const extension = path.extname(baseName).toLowerCase();
      return (
        GitService.IGNORED_CHURN_FILES.has(baseName) ||
        GitService.IGNORED_CHURN_EXTENSIONS.has(extension)
      );
    };

    output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .forEach(line => {
        const match = line.match(/^(\S+)\t(\S+)\t(.+)$/);
        if (!match) {
          return;
        }

        const [, addedRaw, deletedRaw, filePath] = match;
        if (shouldIgnoreFile(filePath)) {
          return;
        }
        const added = addedRaw === '-' ? 0 : Number.parseInt(addedRaw, 10);
        const deleted = deletedRaw === '-' ? 0 : Number.parseInt(deletedRaw, 10);

        const existing = churnMap.get(filePath) || { added: 0, deleted: 0 };
        churnMap.set(filePath, {
          added: existing.added + added,
          deleted: existing.deleted + deleted,
        });
      });

    return Array.from(churnMap.entries())
      .map(([filePath, stats]) => ({
        filePath,
        linesAdded: stats.added,
        linesDeleted: stats.deleted,
        totalChanges: stats.added + stats.deleted,
      }))
      .sort((a, b) => b.totalChanges - a.totalChanges);
  }

  /**
   * Calculates the start of the week (Monday) for a given date.
   *
   * @param date - Date to calculate week start for
   * @returns Date object representing the Monday of that week
   */
  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * Calculates the ISO week number for a given date.
   *
   * @param date - Date to calculate ISO week number for
   * @returns ISO week number (1-53)
   */
  private getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  /**
   * Builds weekly, monthly, and yearly aggregations from commit data.
   * Creates nested structures where weeks are grouped into months, and months into years.
   *
   * @param commits - Array of commit statistics to aggregate
   * @returns Aggregated statistics organized by time periods
   */
  private buildAggregations(commits: CommitStats[]): {
    yearly: YearlyStats[];
    monthly: MonthlyStats[];
    weekly: WeeklyStats[];
  } {
    // Maps for aggregation
    const weeklyMap = new Map<string, WeeklyStats>();
    const monthlyMap = new Map<string, MonthlyStats>();
    const yearlyMap = new Map<number, YearlyStats>();

    // Process commits in reverse order (oldest to newest)
    for (let i = commits.length - 1; i >= 0; i--) {
      const commit = commits[i];
      const commitDate = new Date(commit.date);
      const year = commitDate.getFullYear();
      const month = `${year}-${String(commitDate.getMonth() + 1).padStart(2, '0')}`;
      const weekStart = this.getWeekStart(commitDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekNumber = this.getISOWeek(commitDate);

      // Weekly aggregation
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          weekStart: weekKey,
          weekNumber,
          year,
          commits: 0,
          linesAdded: 0,
          linesRemoved: 0,
          authors: [],
          filesChanged: 0,
          commitHashes: [],
        });
      }
      const weekStats = weeklyMap.get(weekKey)!;
      weekStats.commits++;
      weekStats.linesAdded += commit.insertions;
      weekStats.linesRemoved += commit.deletions;
      weekStats.filesChanged += commit.files;
      weekStats.commitHashes.push(commit.hash);
      if (!weekStats.authors.includes(commit.author)) {
        weekStats.authors.push(commit.author);
      }

      // Monthly aggregation
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          commits: 0,
          linesAdded: 0,
          linesRemoved: 0,
          authors: [],
          filesChanged: 0,
          weeks: [],
        });
      }
      const monthStats = monthlyMap.get(month)!;
      monthStats.commits++;
      monthStats.linesAdded += commit.insertions;
      monthStats.linesRemoved += commit.deletions;
      monthStats.filesChanged += commit.files;
      if (!monthStats.authors.includes(commit.author)) {
        monthStats.authors.push(commit.author);
      }

      // Yearly aggregation
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          commits: 0,
          linesAdded: 0,
          linesRemoved: 0,
          authors: [],
          filesChanged: 0,
          months: [],
        });
      }
      const yearStats = yearlyMap.get(year)!;
      yearStats.commits++;
      yearStats.linesAdded += commit.insertions;
      yearStats.linesRemoved += commit.deletions;
      yearStats.filesChanged += commit.files;
      if (!yearStats.authors.includes(commit.author)) {
        yearStats.authors.push(commit.author);
      }
    }

    // Build nested structure: weeks into months, months into years
    const weekly = Array.from(weeklyMap.values()).sort((a, b) =>
      a.weekStart.localeCompare(b.weekStart)
    );

    const monthly = Array.from(monthlyMap.values())
      .map(month => {
        // Find weeks that belong to this month
        const monthWeeks = weekly.filter(week => week.weekStart.startsWith(month.month));
        return { ...month, weeks: monthWeeks };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    const yearly = Array.from(yearlyMap.values())
      .map(year => {
        // Find months that belong to this year
        const yearMonths = monthly.filter(month => month.month.startsWith(String(year.year)));
        return { ...year, months: yearMonths };
      })
      .sort((a, b) => a.year - b.year);

    return { yearly, monthly, weekly };
  }

  /**
   * Retrieves basic information about a Git repository.
   *
   * @param repoPath - Absolute path to the repository
   * @returns Object containing branches, remotes, and repo validity status
   */
  async getRepositoryInfo(repoPath: string): Promise<{
    branches: string[];
    remotes: string[];
    isRepo: boolean;
  }> {
    try {
      this.git = simpleGit(repoPath);
      const isRepo = await this.git.checkIsRepo();

      if (!isRepo) {
        return { branches: [], remotes: [], isRepo: false };
      }

      const branches = (await this.git.branchLocal()).all;
      const remotes = (await this.git.getRemotes()).map(r => r.name);

      return { branches, remotes, isRepo: true };
    } catch (error) {
      return { branches: [], remotes: [], isRepo: false };
    }
  }

  /**
   * Recursively scans a folder for Git repositories up to a maximum depth.
   *
   * @param folderPath - Path to the folder to scan
   * @param maxDepth - Maximum depth to scan (defaults to 3)
   * @returns Array of paths to found Git repositories
   * @throws {Error} If folder does not exist
   */
  async scanFolderForRepos(folderPath: string, maxDepth: number = 3): Promise<string[]> {
    const foundRepos: string[] = [];

    const scanDirectory = async (currentPath: string, currentDepth: number): Promise<void> => {
      if (currentDepth > maxDepth) {
        return;
      }

      try {
        // Check if current directory is a git repo
        const isRepo = await simpleGit(currentPath).checkIsRepo();
        if (isRepo) {
          foundRepos.push(currentPath);
          // Don't scan subdirectories of git repos
          return;
        }

        // If not a repo, scan subdirectories
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            const subPath = path.join(currentPath, entry.name);
            await scanDirectory(subPath, currentDepth + 1);
          }
        }
      } catch (error) {
        // Skip directories we can't access
        console.warn(
          `Could not scan ${currentPath}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    };

    if (!(await fs.pathExists(folderPath))) {
      throw new Error(`Folder does not exist: ${folderPath}`);
    }

    await scanDirectory(folderPath, 0);
    return foundRepos;
  }
}
