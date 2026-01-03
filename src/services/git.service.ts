import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import * as fs from "fs-extra";
import * as path from "path";
import { config } from "../config";

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

export interface MonthlyStats {
  month: string; // YYYY-MM format
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  weeks: WeeklyStats[];
}

export interface YearlyStats {
  year: number;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  authors: string[];
  filesChanged: number;
  months: MonthlyStats[];
}

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
}

export class GitService {
  private git: SimpleGit;

  constructor() {
    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: "git",
      maxConcurrentProcesses: 6,
      trimmed: false,
    };
    this.git = simpleGit(options);
  }

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to setup local repository: ${errorMessage}`);
    }
  }

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to clone/update repository: ${errorMessage}`);
    }
  }

  async analyzeRepository(
    repoPath: string,
    branch: string = "main"
  ): Promise<RepoAnalysisResult> {
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
            hash: "%H",
            author: "%an",
            email: "%ae",
            date: "%aI",
            message: "%s",
          },
          "--stat": "4096", // Get diff stats
          "--no-merges": null, // Exclude merge commits
        });
      } catch (error) {
        // Repository has no commits yet
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("does not have any commits yet") || 
            errorMessage.includes("your current branch") ||
            errorMessage.includes("bad default revision")) {
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
            const diff = await this.git.diffSummary([
              `${commit.hash}~1..${commit.hash}`,
            ]);
            stats = {
              insertions: diff.insertions,
              deletions: diff.deletions,
              files: diff.files.length,
            };
          } catch (error) {
            console.warn(
              `Could not get diff for commit ${commit.hash}:`,
              error instanceof Error ? error.message : "Unknown error"
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
      commits.forEach((commit) => {
        authorContribution[commit.author] =
          (authorContribution[commit.author] || 0) + 1;
      });

      // Build aggregations
      const aggregations = this.buildAggregations(commits);

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
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in analyzeRepository:", error);
      throw new Error(`Repository analysis failed: ${errorMessage}`);
    }
  }

  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

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

    const monthly = Array.from(monthlyMap.values()).map(month => {
      // Find weeks that belong to this month
      const monthWeeks = weekly.filter(week => week.weekStart.startsWith(month.month));
      return { ...month, weeks: monthWeeks };
    }).sort((a, b) => a.month.localeCompare(b.month));

    const yearly = Array.from(yearlyMap.values()).map(year => {
      // Find months that belong to this year
      const yearMonths = monthly.filter(month => month.month.startsWith(String(year.year)));
      return { ...year, months: yearMonths };
    }).sort((a, b) => a.year - b.year);

    return { yearly, monthly, weekly };
  }

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
      const remotes = (await this.git.getRemotes()).map((r) => r.name);

      return { branches, remotes, isRepo: true };
    } catch (error) {
      return { branches: [], remotes: [], isRepo: false };
    }
  }

  async scanFolderForRepos(
    folderPath: string,
    maxDepth: number = 3
  ): Promise<string[]> {
    const foundRepos: string[] = [];

    const scanDirectory = async (
      currentPath: string,
      currentDepth: number
    ): Promise<void> => {
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
        console.warn(`Could not scan ${currentPath}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    };

    if (!(await fs.pathExists(folderPath))) {
      throw new Error(`Folder does not exist: ${folderPath}`);
    }

    await scanDirectory(folderPath, 0);
    return foundRepos;
  }
}
