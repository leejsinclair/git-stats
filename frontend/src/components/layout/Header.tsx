interface HeaderProps {
  onScanClick: () => void;
  onCleanupClick: () => void;
}

/**
 * Main application header with title and action buttons for scanning and cleanup.
 * 
 * @param props - Component props
 * @param props.onScanClick - Callback when the "Scan Folder" button is clicked
 * @param props.onCleanupClick - Callback when the "Cleanup" button is clicked
 * @returns The application header with title and action buttons
 */
export function Header({ onScanClick, onCleanupClick }: HeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Git Statistics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze and visualize Git repository statistics
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onScanClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          🔍 Scan Folder
        </button>
        <button
          onClick={onCleanupClick}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          🧹 Cleanup
        </button>
      </div>
    </div>
  );
}
