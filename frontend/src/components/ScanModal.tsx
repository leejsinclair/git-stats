import { useState } from 'react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (folder: string) => Promise<{ foundRepos: number; successfulAnalysis: number }>;
  initialFolder?: string;
}

export function ScanModal({ isOpen, onClose, onScan, initialFolder = '/home/lee/projects' }: ScanModalProps) {
  const [scanFolder, setScanFolder] = useState(initialFolder);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleScan() {
    if (!scanFolder.trim()) {
      setError('Please enter a folder path');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setScanProgress('Scanning folder for repositories...');
      
      await onScan(scanFolder);
      
      setScanProgress('Scan complete!');
      setTimeout(() => {
        onClose();
        setScanProgress('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan folder');
      setScanProgress('');
    } finally {
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
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
            {scanProgress}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={scanning}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
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
        </div>
      </div>
    </div>
  );
}
