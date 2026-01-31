import { useState } from 'react';

interface CleanupInfo {
  oldFilesCount: number;
  currentFilesCount: number;
}

interface CleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  cleanupInfo: CleanupInfo | null;
}

export function CleanupModal({ isOpen, onClose, onConfirm, cleanupInfo }: CleanupModalProps) {
  const [cleaning, setCleaning] = useState(false);

  if (!isOpen || !cleanupInfo) return null;

  async function handleConfirm() {
    try {
      setCleaning(true);
      await onConfirm();
      onClose();
    } catch (err) {
      // Error handling is done in parent
    } finally {
      setCleaning(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🧹 Cleanup Old Analysis Files
        </h2>

        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400">Current Files</div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {cleanupInfo.currentFilesCount}
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-sm text-red-600 dark:text-red-400">Old Files</div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                {cleanupInfo.oldFilesCount}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {cleanupInfo.oldFilesCount + cleanupInfo.currentFilesCount}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ This will permanently delete <strong>{cleanupInfo.oldFilesCount}</strong> old analysis file(s) that are not referenced in metadata.json.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={cleaning}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={cleaning || cleanupInfo.oldFilesCount === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {cleaning ? (
              <>
                <span className="animate-spin">⟳</span>
                Cleaning...
              </>
            ) : (
              <>🗑️ Delete Old Files</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
