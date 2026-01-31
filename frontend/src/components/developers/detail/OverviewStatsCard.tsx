interface OverviewStatsCardProps {
  repositoryCount: number;
  linesModified: number;
  activeDays: number;
  averageCommitsPerDay: number;
}

export function OverviewStatsCard({ repositoryCount, linesModified, activeDays, averageCommitsPerDay }: OverviewStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Repositories</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {repositoryCount}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines Modified</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {linesModified.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {activeDays}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Commits/Day</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {averageCommitsPerDay.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
