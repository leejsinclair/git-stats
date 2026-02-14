import type { RepoAnalysisResult } from '../../types';
import { AuthorContributionChart } from '../charts/AuthorContributionChart';
import { CommitTrendChart } from '../charts/CommitTrendChart';
import { MonthlyActivityChart } from '../charts/MonthlyActivityChart';

interface RepoDetailViewProps {
  analysis: RepoAnalysisResult;
  onBack: () => void;
}

/**
 * Displays detailed analysis and statistics for a single repository.
 * 
 * @param props - Component props
 * @param props.analysis - Complete repository analysis including commits, contributors, and aggregations
 * @param props.onBack - Callback to navigate back to the repositories list
 * @returns A detailed view with charts, statistics, and commit history for a repository
 */
export function RepoDetailView({ analysis, onBack }: RepoDetailViewProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString() : 'N/A');
  const churnFiles = analysis.codeChurn?.files ?? [];
  const churnMax = churnFiles.reduce((max, file) => Math.max(max, file.totalChanges), 0);
  const churnLevel = (changes: number) => {
    const ratio = churnMax > 0 ? changes / churnMax : 0;
    if (ratio >= 0.7) {
      return {
        label: 'problematic',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
      };
    }
    if (ratio >= 0.4) {
      return {
        label: 'watch',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
      };
    }
    return {
      label: 'ok',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <button
          onClick={onBack}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
        >
          ← Back to repositories
        </button>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {analysis.repoName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Branch: <span className="font-mono">{analysis.branch}</span>
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Commits</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(analysis.totalCommits)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">Contributors</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {analysis.authors.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines Added</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            +{formatNumber(analysis.summary.totalLinesAdded)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines Removed</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            -{formatNumber(analysis.summary.totalLinesRemoved)}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Repository Timeline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">First Commit</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatDate(analysis.dateRange.firstCommit)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Latest Commit</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatDate(analysis.dateRange.lastCommit)}
            </div>
          </div>
        </div>
      </div>

      {/* Code Churn */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code Churn</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last {analysis.codeChurn?.since ?? '1 month'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Changes
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(analysis.codeChurn?.totalChanges ?? 0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lines Added
            </div>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatNumber(analysis.codeChurn?.linesAdded ?? 0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lines Deleted
            </div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              -{formatNumber(analysis.codeChurn?.linesDeleted ?? 0)}
            </div>
          </div>
        </div>

        {churnFiles.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No churn data available for the selected window.
          </div>
        ) : (
          <div className="space-y-3">
            {churnFiles.slice(0, 10).map(file => {
              const level = churnLevel(file.totalChanges);
              return (
                <div
                  key={file.filePath}
                  className="flex flex-col md:flex-row md:items-center gap-3 border border-gray-100 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.filePath}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{formatNumber(file.linesAdded)} / -{formatNumber(file.linesDeleted)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${level.className}`}>
                      {level.label}
                    </span>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(file.totalChanges)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts */}
      {analysis.aggregations.weekly.length > 0 && (
        <CommitTrendChart data={analysis.aggregations.weekly} />
      )}

      {analysis.aggregations.monthly.length > 0 && (
        <MonthlyActivityChart data={analysis.aggregations.monthly} />
      )}

      <AuthorContributionChart data={analysis.summary.authorContribution} />

      {/* Recent Commits */}
      {analysis.recentCommits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Commits ({analysis.recentCommits.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysis.recentCommits.slice(0, 20).map(commit => (
              <div
                key={commit.hash}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-gray-900 dark:text-white">{commit.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    {new Date(commit.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {commit.author} •
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    +{commit.insertions}
                  </span>
                  <span className="text-red-600 dark:text-red-400 ml-1">-{commit.deletions}</span>
                  <span className="ml-2">{commit.files} files</span>
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">
                  {commit.hash.substring(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
