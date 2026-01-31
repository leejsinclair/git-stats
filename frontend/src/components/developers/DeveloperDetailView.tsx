import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DeveloperStats } from '../../types';

interface DeveloperDetailViewProps {
  developer: DeveloperStats;
  onBack: () => void;
}

export function DeveloperDetailView({ developer, onBack }: DeveloperDetailViewProps) {
  const { name, email, metrics, messageCompliance, activity, recentCommits, commitSizeDistribution, commitTypeDistribution, workingHoursAnalysis } = developer;

  // Extract scope from conventional commit message
  const extractScope = (message: string): { type: string; scope: string | null; description: string } | null => {
    const match = message.match(/^([a-z]+)(\(([a-z0-9-]+)\))?:\s*(.+)/i);
    if (match) {
      return {
        type: match[1].toLowerCase(),
        scope: match[3] || null,
        description: match[4],
      };
    }
    return null;
  };

  // Check commit message for issues
  const checkMessageIssues = (message: string): string[] => {
    const issues: string[] = [];
    const subject = message.split('\n')[0];
    const parsed = extractScope(subject);

    // Check subject length
    if (subject.length > 50) {
      issues.push(subject.length > 72 ? 'Subject too long (>72)' : 'Subject long (>50)');
    }

    // Check capitalization (only if not conventional commit)
    if (!parsed && subject.length > 0 && subject[0] !== subject[0].toUpperCase()) {
      issues.push('Not capitalized');
    }

    // Check for period at end
    if (subject.endsWith('.')) {
      issues.push('Ends with period');
    }

    return issues;
  };

  // Prepare day of week chart data
  const dayOfWeekData = Object.entries(activity.commitsByDayOfWeek).map(([day, count]) => ({
    day: day.substring(0, 3),
    commits: count,
  }));

  // Prepare hour distribution data
  const hourData = Object.entries(activity.commitsByHour)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      commits: count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Prepare recent activity data
  const recentActivityData = [...activity.recentActivity]
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commits: item.commits,
      added: item.linesAdded,
      removed: item.linesRemoved,
    }));

  // Prepare repository contribution data
  const repoCommits = new Map<string, number>();
  for (const commit of recentCommits) {
    repoCommits.set(commit.repo, (repoCommits.get(commit.repo) || 0) + 1);
  }
  const repoData = Array.from(repoCommits.entries())
    .map(([repo, commits]) => ({ repo, commits }))
    .sort((a, b) => b.commits - a.commits);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Prepare commit size distribution data
  const commitSizeData = [
    { size: 'Tiny (1-10)', commits: commitSizeDistribution.tiny, color: '#10b981' },
    { size: 'Small (11-50)', commits: commitSizeDistribution.small, color: '#3b82f6' },
    { size: 'Medium (51-200)', commits: commitSizeDistribution.medium, color: '#f59e0b' },
    { size: 'Large (201-400)', commits: commitSizeDistribution.large, color: '#ef4444' },
    { size: 'Huge (401+)', commits: commitSizeDistribution.huge, color: '#dc2626' },
  ].filter(item => item.commits > 0);

  // Prepare commit type distribution data
  const commitTypeData = [
    { type: 'feat', count: commitTypeDistribution.feat, label: 'Features' },
    { type: 'fix', count: commitTypeDistribution.fix, label: 'Bug Fixes' },
    { type: 'refactor', count: commitTypeDistribution.refactor, label: 'Refactoring' },
    { type: 'docs', count: commitTypeDistribution.docs, label: 'Documentation' },
    { type: 'test', count: commitTypeDistribution.test, label: 'Tests' },
    { type: 'chore', count: commitTypeDistribution.chore, label: 'Chores' },
    { type: 'style', count: commitTypeDistribution.style, label: 'Style' },
    { type: 'perf', count: commitTypeDistribution.perf, label: 'Performance' },
    { type: 'build', count: commitTypeDistribution.build, label: 'Build' },
    { type: 'ci', count: commitTypeDistribution.ci, label: 'CI/CD' },
    { type: 'other', count: commitTypeDistribution.other, label: 'Other' },
  ].filter(item => item.count > 0);

  // Prepare working hours data
  const workingHoursData = [
    { period: 'Business Hours', commits: workingHoursAnalysis.businessHoursCommits, color: '#10b981' },
    { period: 'Late Night', commits: workingHoursAnalysis.lateNightCommits, color: '#ef4444' },
    { period: 'Other Hours', commits: recentCommits.length - workingHoursAnalysis.businessHoursCommits - workingHoursAnalysis.lateNightCommits, color: '#6b7280' },
  ].filter(item => item.commits > 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          ← Back to Developers
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{email}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.totalCommits}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Commits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Quality Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Commit Size Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Commit Size Distribution
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {commitSizeDistribution.averageLinesPerCommit.toFixed(0)} lines
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Median</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {commitSizeDistribution.medianLinesPerCommit.toFixed(0)} lines
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={commitSizeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="size" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="commits">
                {commitSizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            💡 Best practice: Keep commits between 50-200 lines for easier review
          </div>
        </div>

        {/* Commit Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Commit Type Distribution
          </h2>
          <div className="mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Bug Fix Ratio</div>
            <div className={`text-lg font-bold ${
              commitTypeDistribution.bugFixRatio > 0.4 
                ? 'text-red-600 dark:text-red-400' 
                : commitTypeDistribution.bugFixRatio > 0.25
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {(commitTypeDistribution.bugFixRatio * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {commitTypeDistribution.bugFixRatio > 0.4 ? '⚠️ High - Consider improving testing' : 
               commitTypeDistribution.bugFixRatio > 0.25 ? '✓ Good range' : 
               '✓ Excellent - Few bugs'}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={commitTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="label" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Working Hours Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Working Hours Pattern
          </h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Late Night</div>
              <div className={`text-lg font-bold ${
                workingHoursAnalysis.lateNightPercentage > 30 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {workingHoursAnalysis.lateNightPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Weekend</div>
              <div className={`text-lg font-bold ${
                workingHoursAnalysis.weekendPercentage > 30 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {workingHoursAnalysis.weekendPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400">Pattern</div>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {workingHoursAnalysis.preferredWorkingHours}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={workingHoursData}
                dataKey="commits"
                nameKey="period"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {workingHoursData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {workingHoursAnalysis.lateNightPercentage > 30 && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400">
              ⚠️ High late-night activity may indicate burnout risk
            </div>
          )}
        </div>

        {/* Work Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Work Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={commitTypeData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {commitTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Documentation Ratio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Documentation Ratio
          </h2>
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold ${
              metrics.documentationRatio >= 15 
                ? 'text-green-600 dark:text-green-400' 
                : metrics.documentationRatio >= 10
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {metrics.documentationRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              of total commits
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Status</div>
            <div className={`text-sm font-medium ${
              metrics.documentationRatio >= 15 
                ? 'text-green-600 dark:text-green-400' 
                : metrics.documentationRatio >= 10
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {metrics.documentationRatio >= 15 
                ? '✓ Excellent - Well documented' 
                : metrics.documentationRatio >= 10
                ? '✓ Good - Could improve'
                : '⚠️ Low - Needs more documentation'}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            💡 Includes commits with docs:, README, or documentation keywords
          </div>
        </div>

        {/* Test Ratio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Test Coverage Ratio
          </h2>
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold ${
              metrics.testRatio >= 20 
                ? 'text-green-600 dark:text-green-400' 
                : metrics.testRatio >= 10
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {metrics.testRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              of total commits
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Status</div>
            <div className={`text-sm font-medium ${
              metrics.testRatio >= 20 
                ? 'text-green-600 dark:text-green-400' 
                : metrics.testRatio >= 10
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {metrics.testRatio >= 20 
                ? '✓ Excellent - Strong testing culture' 
                : metrics.testRatio >= 10
                ? '✓ Good - Room for improvement'
                : '⚠️ Low - Consider adding more tests'}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            💡 Includes commits with test:, spec, or testing keywords
          </div>
        </div>
      </div>

      {/* Repository and Activity Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Repositories</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.repositories.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Lines Modified</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.linesModified.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activity.activeDays}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Commits/Day</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {activity.averageCommitsPerDay.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Message Compliance Section */}
      {messageCompliance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Commit Message Compliance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {messageCompliance.passPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {messageCompliance.averageScore.toFixed(1)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Valid Messages</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {messageCompliance.validMessages}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {messageCompliance.totalMessages}
              </div>
            </div>
          </div>

          {messageCompliance.commonIssues.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Common Issues
              </h3>
              <div className="space-y-2">
                {messageCompliance.commonIssues.map((issue, index) => (
                  <div
                    key={issue.rule}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}. {issue.description}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                        ({issue.rule})
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {issue.count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Day of Week Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Commits by Day of Week
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="commits" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Repository Contributions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Repository Contributions
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repoData}
                dataKey="commits"
                nameKey="repo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {repoData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hour Distribution */}
        {hourData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Commits by Hour of Day
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="commits" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} name="Commits" />
              <Line type="monotone" dataKey="added" stroke="#10b981" strokeWidth={2} name="Lines Added" />
              <Line type="monotone" dataKey="removed" stroke="#ef4444" strokeWidth={2} name="Lines Removed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Commits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Commits</h2>
        <div className="space-y-3">
          {recentCommits.slice(0, 20).map((commit) => {
            const parsed = extractScope(commit.message.split('\n')[0]);
            const issues = checkMessageIssues(commit.message);
            const typeColors: Record<string, string> = {
              feat: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              fix: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              docs: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              style: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
              refactor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              perf: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
              test: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              build: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
              ci: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
              chore: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            };

            return (
              <div
                key={commit.hash}
                className={`p-4 rounded-lg border ${
                  issues.length > 0
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {parsed && (
                        <>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[parsed.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                            {parsed.type}
                          </span>
                          {parsed.scope && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                              {parsed.scope}
                            </span>
                          )}
                        </>
                      )}
                      {issues.length > 0 && (
                        <div className="flex items-center gap-1">
                          {issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
                              title="Message compliance issue"
                            >
                              ⚠️ {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {parsed ? parsed.description : commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-mono">{commit.hash.substring(0, 8)}</span>
                      <span>{commit.repo}</span>
                      <span>{new Date(commit.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs ml-4">
                    <span className="text-green-600 dark:text-green-400">
                      +{commit.insertions}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      -{commit.deletions}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
