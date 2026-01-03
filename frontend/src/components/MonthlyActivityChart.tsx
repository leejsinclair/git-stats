import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MonthlyStats } from '../types';

interface MonthlyActivityChartProps {
  data: MonthlyStats[];
  title?: string;
}

export function MonthlyActivityChart({
  data,
  title = 'Monthly Activity',
}: MonthlyActivityChartProps) {
  const chartData = data.map(month => ({
    month: month.month,
    commits: month.commits,
    authors: month.authors.length,
    files: month.filesChanged,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6',
            }}
          />
          <Legend />
          <Bar dataKey="commits" fill="#3B82F6" name="Commits" radius={[4, 4, 0, 0]} />
          <Bar dataKey="authors" fill="#10B981" name="Active Authors" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
