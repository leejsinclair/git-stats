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
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanFolder, setScanFolder] = useState('/home/lee/projects');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');

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

  async function handleScanFolder() {
    if (!scanFolder.trim()) {
      setError('Please enter a folder path');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setScanProgress('Scanning folder for repositories...');
      
      const result = await api.analyzeFolder(scanFolder, 3, 'main', true);
      
      setScanProgress(`Found ${result.foundRepos} repositories, analyzed ${result.successfulAnalysis}`);
      
      setTimeout(async () => {
        await loadMetadata();
        setShowScanModal(false);
        setScanProgress('');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan folder');
      setScanProgress('');
    } finally {
      setScanning(false);
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Git Stats Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze and visualize git repository statistics
            </p>
          </div>
          <button
            onClick={() => setShowScanModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            📁 Scan Folder
          </button>
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

      {/* Scan Folder Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Scan Folder for Repositories
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder Path
              </label>
              <input
                type="text"
                value={scanFolder}
                onChange={(e) => setScanFolder(e.target.value)}
                placeholder="/home/lee/projects"
                disabled={scanning}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will scan up to 3 levels deep for git repositories
              </p>
            </div>

            {scanProgress && (
              <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                {scanProgress}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setScanProgress('');
                }}
                disabled={scanning}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScanFolder}
                disabled={scanning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {scanning ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Scanning...
                  </>
                ) : (
                  'Scan & Analyze'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

