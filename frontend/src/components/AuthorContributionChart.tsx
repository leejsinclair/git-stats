import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AuthorContributionChartProps {
  data: Record<string, number>;
  title?: string;
}

export function AuthorContributionChart({ data, title = 'Author Contributions' }: AuthorContributionChartProps) {
  const chartData = Object.entries(data)
    .map(([author, commits]) => ({
      author: author.length > 20 ? author.substring(0, 20) + '...' : author,
      commits,
    }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10); // Top 10 contributors

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="author" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
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
          <Bar 
            dataKey="commits" 
            fill="#8B5CF6" 
            name="Commits"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
