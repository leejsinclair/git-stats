import { useEffect, useState } from 'react';

import { api } from '../../api';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (folder: string) => Promise<{ scanId: string }>;
  onScanComplete: () => void | Promise<void>;
  initialFolder?: string;
}

/**
 * Modal dialog for scanning a folder to discover Git repositories.
 * 
 * @param props - Component props
 * @param props.isOpen - Whether the modal is currently visible
 * @param props.onClose - Callback to close the modal
 * @param props.onScan - Async callback to scan a folder and analyze repositories
 * @param props.initialFolder - Default folder path to scan
 * @returns A modal component for repository scanning
 */
export function ScanModal({
  isOpen,
  onClose,
  onScan,
  onScanComplete,
  initialFolder = '..',
}: ScanModalProps) {
  const [scanFolder, setScanFolder] = useState(initialFolder);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<
    'idle' | 'scanning' | 'analyzing' | 'complete' | 'error'
  >('idle');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [scannedCount, setScannedCount] = useState(0);
  const [foundRepos, setFoundRepos] = useState(0);
  const [successfulAnalysis, setSuccessfulAnalysis] = useState(0);
  const [failedAnalysis, setFailedAnalysis] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setScanning(false);
    setScanProgress('');
    setScanId(null);
    setScanStatus('idle');
    setCurrentFolder('');
    setScannedCount(0);
    setFoundRepos(0);
    setSuccessfulAnalysis(0);
    setFailedAnalysis(0);
    setError(null);
  };

  useEffect(() => {
    if (!scanId) return;

    let cancelled = false;

    const pollProgress = async () => {
      try {
        const progress = await api.getFolderScanProgress(scanId);
        if (cancelled) return;

        setScanStatus(progress.status);
        setCurrentFolder(progress.currentFolder ?? '');
        setScannedCount(progress.scannedCount);
        setFoundRepos(progress.foundRepos);
        setSuccessfulAnalysis(progress.successfulAnalysis);
        setFailedAnalysis(progress.failedAnalysis);

        if (progress.status === 'error') {
          setError(progress.error ?? 'Failed to scan folder');
          setScanProgress('');
          setScanning(false);
          setScanId(null);
          return;
        }

        if (progress.status === 'complete') {
          setScanProgress(progress.message ?? 'Scan complete!');
          setScanning(false);
          setScanId(null);
          await onScanComplete();
          return;
        }

        setScanProgress(
          progress.status === 'analyzing'
            ? 'Analyzing repositories...'
            : 'Scanning folders...'
        );
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch scan progress');
        setScanProgress('');
        setScanning(false);
        setScanId(null);
      }
    };

    pollProgress();
    const intervalId = window.setInterval(pollProgress, 800);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [scanId, onClose, onScanComplete]);

  if (!isOpen) return null;

  async function handleScan() {
    if (!scanFolder.trim()) {
      setError('Please enter a folder path');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setScanProgress('Starting scan...');
      setScanStatus('scanning');

      const result = await onScan(scanFolder);
      setScanId(result.scanId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan folder');
      setScanProgress('');
      setScanning(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🔍 Scan Folder for Repositories
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Folder Path
          </label>
          <input
            type="text"
            value={scanFolder}
            onChange={(e) => setScanFolder(e.target.value)}
            placeholder="/path/to/folder"
            disabled={scanning}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {scanProgress && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            scanStatus === 'complete' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }`}>
            {scanProgress}
          </div>
        )}

        {(scanning || scanStatus !== 'idle') && (
          <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 rounded-lg text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span>Folders scanned</span>
              <span className="font-semibold">{scannedCount}</span>
            </div>
            {foundRepos > 0 && (
              <div className="flex items-center justify-between">
                <span>Repositories found</span>
                <span className="font-semibold">{foundRepos}</span>
              </div>
            )}
            {currentFolder && scanStatus !== 'complete' && (
              <div className="text-xs text-slate-600 dark:text-slate-300 break-all">
                Current folder: {currentFolder}
              </div>
            )}
            {(scanStatus === 'analyzing' || scanStatus === 'complete') && foundRepos > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Successfully analyzed: {successfulAnalysis} / {foundRepos}
                {failedAnalysis > 0 && ` (${failedAnalysis} failed)`}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            disabled={scanning}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {scanStatus === 'complete' ? 'Close' : 'Cancel'}
          </button>
          {scanStatus !== 'complete' && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Scanning...
                </>
              ) : (
                '🔍 Scan Folder'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
