import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CommitSizeDistribution } from '../../../types';

interface CommitSizeChartProps {
  distribution: CommitSizeDistribution;
}

export function CommitSizeChart({ distribution }: CommitSizeChartProps) {
  const commitSizeData = [
    { size: 'Tiny (1-10)', commits: distribution.tiny, color: '#10b981' },
    { size: 'Small (11-50)', commits: distribution.small, color: '#3b82f6' },
    { size: 'Medium (51-200)', commits: distribution.medium, color: '#f59e0b' },
    { size: 'Large (201-400)', commits: distribution.large, color: '#ef4444' },
    { size: 'Huge (401+)', commits: distribution.huge, color: '#dc2626' },
  ].filter((item) => item.commits > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Commit Size Distribution
      </h2>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {distribution.averageLinesPerCommit.toFixed(0)} lines
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Median</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {distribution.medianLinesPerCommit.toFixed(0)} lines
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
  );
}
