import { useState, useEffect } from 'react';
import { api } from './api';
import type { RepoMetadata, RepoAnalysisResult } from './types';
import { RepoCard } from './components/RepoCard';
import { RepoDetailView } from './components/RepoDetailView';

function App() {
  const [repos, setRepos] = useState<RepoMetadata[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ok' | 'error' | 'analyzing'>('all');

  useEffect(() => {
    loadMetadata();
  }, []);

  async function loadMetadata() {
    try {
      setLoading(true);
      setError(null);
      const metadata = await api.getMetadata();
      setRepos(metadata.repositories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }

  async function handleRepoClick(repo: RepoMetadata) {
    if (repo.status !== 'ok' || !repo.outputFile) {
      return;
    }

    try {
      setLoading(true);
      // Extract filename from outputFile path
      const filename = repo.outputFile.split('/').pop();
      if (!filename) return;
      
      // Fetch the analysis file directly
      const response = await fetch(`http://localhost:3000/data/output/${filename}`);
      if (!response.ok) throw new Error('Failed to load analysis');
      const analysis = await response.json();
      setSelectedRepo(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }

  const filteredRepos = filter === 'all' 
    ? repos 
    : repos.filter(r => r.status === filter);

  if (selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <RepoDetailView 
            analysis={selectedRepo} 
            onBack={() => setSelectedRepo(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Git Stats Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze and visualize git repository statistics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            All ({repos.length})
          </button>
          <button
            onClick={() => setFilter('ok')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'ok'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            OK ({repos.filter(r => r.status === 'ok').length})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Errors ({repos.filter(r => r.status === 'error').length})
          </button>
          <button
            onClick={() => setFilter('analyzing')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'analyzing'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Analyzing ({repos.filter(r => r.status === 'analyzing').length})
          </button>
          <button
            onClick={loadMetadata}
            className="ml-auto px-4 py-2 rounded-lg font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Loading repositories...
          </div>
        )}

        {/* Repository Grid */}
        {!loading && filteredRepos.length === 0 && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No repositories found. Analyze some repositories to get started.
          </div>
        )}

        {!loading && filteredRepos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <RepoCard
                key={repo.repoPath}
                repo={repo}
                onClick={() => handleRepoClick(repo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

