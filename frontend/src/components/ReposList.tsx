import { RepoCard } from './RepoCard';
import type { RepoMetadata } from '../types';

type FilterStatus = 'all' | 'ok' | 'error' | 'analyzing';

interface ReposListProps {
  repos: RepoMetadata[];
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  onRepoClick: (repo: RepoMetadata) => void;
}

export function ReposList({ repos, filter, onFilterChange, onRepoClick }: ReposListProps) {
  const filteredRepos = filter === 'all' ? repos : repos.filter(r => r.status === filter);

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          All ({repos.length})
        </button>
        <button
          onClick={() => onFilterChange('ok')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'ok'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          ✓ Analyzed ({repos.filter(r => r.status === 'ok').length})
        </button>
        <button
          onClick={() => onFilterChange('error')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          ✗ Errors ({repos.filter(r => r.status === 'error').length})
        </button>
        <button
          onClick={() => onFilterChange('analyzing')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'analyzing'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          ⟳ Analyzing ({repos.filter(r => r.status === 'analyzing').length})
        </button>
      </div>

      {/* Repository Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.map(repo => (
          <RepoCard key={repo.repoPath} repo={repo} onClick={() => onRepoClick(repo)} />
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No repositories found
        </div>
      )}
    </>
  );
}
