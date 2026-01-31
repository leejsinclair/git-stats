import type { DeveloperStats } from '../types';

interface DeveloperCardProps {
  developer: DeveloperStats;
  onClick: () => void;
}

export function DeveloperCard({ developer, onClick }: DeveloperCardProps) {
  const { name, email, metrics, messageCompliance, activity } = developer;

  const getComplianceColor = (passRate: number) => {
    if (passRate >= 80) return 'text-green-600 dark:text-green-400';
    if (passRate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.totalCommits}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">commits</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Repositories</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {metrics.repositories.length}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {activity.activeDays}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines Modified</div>
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            {metrics.linesModified.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            +{metrics.linesAdded.toLocaleString()} / -{metrics.linesRemoved.toLocaleString()}
          </div>
        </div>
      </div>

      {messageCompliance && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Compliance
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Pass Rate</div>
              <div className={`text-lg font-semibold ${getComplianceColor(messageCompliance.passPercentage)}`}>
                {messageCompliance.passPercentage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
              <div className={`text-lg font-semibold ${getScoreColor(messageCompliance.averageScore)}`}>
                {messageCompliance.averageScore.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <span>
          {activity.averageCommitsPerDay.toFixed(1)} commits/day avg
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          View Details →
        </span>
      </div>
    </div>
  );
}
