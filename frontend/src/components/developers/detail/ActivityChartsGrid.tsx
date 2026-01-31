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

interface ActivityChartsGridProps {
  dayOfWeekData: Array<{ day: string; commits: number }>;
  repoData: Array<{ repo: string; commits: number }>;
  hourData: Array<{ hour: string; commits: number }>;
  recentActivityData: Array<{
    date: string;
    commits: number;
    added: number;
    removed: number;
  }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

/**
 * Displays a grid of activity charts showing commit patterns across time dimensions.
 * 
 * @param props - Component props
 * @param props.dayOfWeekData - Commit counts grouped by day of week
 * @param props.repoData - Commit counts per repository
 * @param props.hourData - Commit counts by hour of day
 * @param props.recentActivityData - Recent activity with commit and line change metrics
 * @returns A responsive grid of bar, pie, and line charts showing developer activity patterns
 */
export function ActivityChartsGrid({ dayOfWeekData, repoData, hourData, recentActivityData }: ActivityChartsGridProps) {
  return (
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
  );
}
