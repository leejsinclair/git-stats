interface Commit {
  hash: string;
  message: string;
  repo: string;
  date: string;
  insertions: number;
  deletions: number;
}

interface RecentCommitsTableProps {
  commits: Commit[];
  maxDisplay?: number;
}

// Extract scope from conventional commit message
const extractScope = (message: string): { type: string; scope: string | null; description: string } | null => {
  const match = message.match(/^([a-z]+)(\(([a-z0-9-]+)\))?:\s*(.+)/i);
  if (match) {
    return {
      type: match[1].toLowerCase(),
      scope: match[3] || null,
      description: match[4],
    };
  }
  return null;
};

// Check commit message for issues
const checkMessageIssues = (message: string): string[] => {
  const issues: string[] = [];
  const subject = message.split('\n')[0];
  const parsed = extractScope(subject);

  // Check subject length
  if (subject.length > 50) {
    issues.push(subject.length > 72 ? 'Subject too long (>72)' : 'Subject long (>50)');
  }

  // Check capitalization (only if not conventional commit)
  if (!parsed && subject.length > 0 && subject[0] !== subject[0].toUpperCase()) {
    issues.push('Not capitalized');
  }

  // Check for period at end
  if (subject.endsWith('.')) {
    issues.push('Ends with period');
  }

  return issues;
};

const typeColors: Record<string, string> = {
  feat: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  fix: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  docs: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  style: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  refactor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  perf: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  test: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  build: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  ci: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  chore: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

/**
 * Displays a table of recent commits with conventional commit type badges and message validation.
 * 
 * @param props - Component props
 * @param props.commits - Array of commit objects to display
 * @param props.maxDisplay - Maximum number of commits to show (defaults to 20)
 * @returns A styled list of commits with type badges, validation warnings, and code change metrics
 */
export function RecentCommitsTable({ commits, maxDisplay = 20 }: RecentCommitsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Commits</h2>
      <div className="space-y-3">
        {commits.slice(0, maxDisplay).map((commit) => {
          const parsed = extractScope(commit.message.split('\n')[0]);
          const issues = checkMessageIssues(commit.message);

          return (
            <div
              key={commit.hash}
              className={`p-4 rounded-lg border ${
                issues.length > 0
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {parsed && (
                      <>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[parsed.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {parsed.type}
                        </span>
                        {parsed.scope && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                            {parsed.scope}
                          </span>
                        )}
                      </>
                    )}
                    {issues.length > 0 && (
                      <div className="flex items-center gap-1">
                        {issues.map((issue, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
                            title="Message compliance issue"
                          >
                            ⚠️ {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {parsed ? parsed.description : commit.message.split('\n')[0]}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-mono">{commit.hash.substring(0, 8)}</span>
                    <span>{commit.repo}</span>
                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs ml-4">
                  <span className="text-green-600 dark:text-green-400">
                    +{commit.insertions}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    -{commit.deletions}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
