import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeeklyStats } from '../types';

interface CommitTrendChartProps {
  data: WeeklyStats[];
  title?: string;
}

export function CommitTrendChart({ data, title = 'Commit Trend Over Time' }: CommitTrendChartProps) {
  const chartData = data.map(week => ({
    date: week.weekStart,
    commits: week.commits,
    linesAdded: week.linesAdded,
    linesRemoved: week.linesRemoved,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="commits" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Commits"
          />
          <Line 
            type="monotone" 
            dataKey="linesAdded" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Lines Added"
          />
          <Line 
            type="monotone" 
            dataKey="linesRemoved" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Lines Removed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
