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
