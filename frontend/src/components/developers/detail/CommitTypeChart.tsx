import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CommitTypeDistribution } from '../../../types';

interface CommitTypeChartProps {
  distribution: CommitTypeDistribution;
}

export function CommitTypeChart({ distribution }: CommitTypeChartProps) {
  const commitTypeData = [
    { type: 'feat', count: distribution.feat, label: 'Features' },
    { type: 'fix', count: distribution.fix, label: 'Bug Fixes' },
    { type: 'refactor', count: distribution.refactor, label: 'Refactoring' },
    { type: 'docs', count: distribution.docs, label: 'Documentation' },
    { type: 'test', count: distribution.test, label: 'Tests' },
    { type: 'chore', count: distribution.chore, label: 'Chores' },
    { type: 'style', count: distribution.style, label: 'Style' },
    { type: 'perf', count: distribution.perf, label: 'Performance' },
    { type: 'build', count: distribution.build, label: 'Build' },
    { type: 'ci', count: distribution.ci, label: 'CI/CD' },
    { type: 'other', count: distribution.other, label: 'Other' },
  ].filter((item) => item.count > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Commit Type Distribution
      </h2>
      <div className="mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400">Bug Fix Ratio</div>
        <div
          className={`text-lg font-bold ${
            distribution.bugFixRatio > 0.4
              ? 'text-red-600 dark:text-red-400'
              : distribution.bugFixRatio > 0.25
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
          }`}
        >
          {(distribution.bugFixRatio * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {distribution.bugFixRatio > 0.4
            ? '⚠️ High - Consider improving testing'
            : distribution.bugFixRatio > 0.25
              ? '✓ Good range'
              : '✓ Excellent - Few bugs'}
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
  );
}
