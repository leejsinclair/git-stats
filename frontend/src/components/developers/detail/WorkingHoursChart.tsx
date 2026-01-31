import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { WorkingHoursAnalysis } from '../../../types';

interface WorkingHoursChartProps {
  analysis: WorkingHoursAnalysis;
  totalCommits: number;
}

export function WorkingHoursChart({ analysis, totalCommits }: WorkingHoursChartProps) {
  const workingHoursData = [
    { period: 'Business Hours', commits: analysis.businessHoursCommits, color: '#10b981' },
    { period: 'Late Night', commits: analysis.lateNightCommits, color: '#ef4444' },
    {
      period: 'Other Hours',
      commits: totalCommits - analysis.businessHoursCommits - analysis.lateNightCommits,
      color: '#6b7280',
    },
  ].filter((item) => item.commits > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Working Hours Pattern
      </h2>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Late Night</div>
          <div
            className={`text-lg font-bold ${
              analysis.lateNightPercentage > 30
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {analysis.lateNightPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Weekend</div>
          <div
            className={`text-lg font-bold ${
              analysis.weekendPercentage > 30
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {analysis.weekendPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">Pattern</div>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {analysis.preferredWorkingHours}
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
      {analysis.lateNightPercentage > 30 && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400">
          ⚠️ High late-night activity may indicate burnout risk
        </div>
      )}
    </div>
  );
}
