interface MessageComplianceCardProps {
  passPercentage: number;
  averageScore: number;
  validMessages: number;
  totalMessages: number;
  commonIssues: Array<{
    rule: string;
    description: string;
    count: number;
  }>;
}

export function MessageComplianceCard({ passPercentage, averageScore, validMessages, totalMessages, commonIssues }: MessageComplianceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Commit Message Compliance
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {passPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {averageScore.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Valid Messages</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {validMessages}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {totalMessages}
          </div>
        </div>
      </div>

      {commonIssues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Common Issues
          </h3>
          <div className="space-y-2">
            {commonIssues.map((issue, index) => (
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
  );
}
