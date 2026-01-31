import type { RepoMetadata } from '../../types';

interface RepoCardProps {
  repo: RepoMetadata;
  onClick: () => void;
}

export function RepoCard({ repo, onClick }: RepoCardProps) {
  const statusColors = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    analyzing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const statusIcons = {
    ok: '✓',
    error: '✗',
    analyzing: '⟳',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
          {repo.repoName}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[repo.status]}`}>
          {statusIcons[repo.status]} {repo.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">{repo.repoPath}</p>

      <div className="text-xs text-gray-500 dark:text-gray-500">
        <div>
          Branch: <span className="font-mono">{repo.branch || 'N/A'}</span>
        </div>
        <div>Last analyzed: {new Date(repo.lastAnalyzed).toLocaleString()}</div>
      </div>

      {repo.error && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {repo.error}
        </div>
      )}
    </div>
  );
}
