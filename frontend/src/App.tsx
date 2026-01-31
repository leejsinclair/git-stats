import { useEffect, useState } from 'react';

import { api } from './api';
import { CleanupModal } from './components/CleanupModal';
import { DeveloperDetailView } from './components/DeveloperDetailView';
import { DevelopersList } from './components/DevelopersList';
import { Header } from './components/Header';
import { RepoDetailView } from './components/RepoDetailView';
import { ReposList } from './components/ReposList';
import { ScanModal } from './components/ScanModal';
import { ViewTabs } from './components/ViewTabs';
import type { DeveloperStats, RepoAnalysisResult, RepoMetadata } from './types';

type ViewMode = 'repos' | 'developers';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('repos');
  const [repos, setRepos] = useState<RepoMetadata[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoAnalysisResult | null>(null);
  const [developers, setDevelopers] = useState<DeveloperStats[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ok' | 'error' | 'analyzing'>('all');
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupInfo, setCleanupInfo] = useState<{ oldFilesCount: number; currentFilesCount: number } | null>(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (viewMode === 'developers') {
      loadDeveloperStats();
    }
  }, [viewMode]);

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

  async function loadDeveloperStats() {
    try {
      setLoading(true);
      setError(null);
      const report = await api.getDeveloperStats();
      setDevelopers(report.developers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load developer statistics');
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
      const filename = repo.outputFile.split('/').pop();
      if (!filename) return;

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

  async function handleScanFolder(folder: string) {
    const result = await api.analyzeFolder(folder, 3, 'main', true);
    await loadMetadata();
    return result;
  }

  async function handleCleanupClick() {
    try {
      const info = await api.previewOldFiles();
      setCleanupInfo(info);
      setShowCleanupModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview old files');
    }
  }

  async function handleCleanupConfirm() {
    const result = await api.cleanupOldFiles();
    alert(`${result.message}\n\nDeleted files:\n${result.deletedFiles.join('\n')}`);
    setCleanupInfo(null);
  }

  // Developer Detail View
  if (selectedDeveloper) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <DeveloperDetailView developer={selectedDeveloper} onBack={() => setSelectedDeveloper(null)} />
        </div>
      </div>
    );
  }

  // Repository Detail View
  if (selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <RepoDetailView analysis={selectedRepo} onBack={() => setSelectedRepo(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <Header
          onScanClick={() => setShowScanModal(true)}
          onCleanupClick={handleCleanupClick}
        />

        <ViewTabs viewMode={viewMode} onViewModeChange={setViewMode} />

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <span className="text-4xl animate-spin inline-block">⟳</span>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {!loading && viewMode === 'repos' && (
          <ReposList
            repos={repos}
            filter={filter}
            onFilterChange={setFilter}
            onRepoClick={handleRepoClick}
          />
        )}

        {!loading && viewMode === 'developers' && (
          <DevelopersList
            developers={developers}
            loading={false}
            onDeveloperClick={setSelectedDeveloper}
          />
        )}
      </div>

      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScanFolder}
      />

      <CleanupModal
        isOpen={showCleanupModal}
        onClose={() => {
          setShowCleanupModal(false);
          setCleanupInfo(null);
        }}
        onConfirm={handleCleanupConfirm}
        cleanupInfo={cleanupInfo}
      />
    </div>
  );
}

export default App;
