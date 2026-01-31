type ViewMode = 'repos' | 'developers';

interface ViewTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Tab navigation to switch between repositories and developers views.
 * 
 * @param props - Component props
 * @param props.viewMode - Currently active view mode ('repos' or 'developers')
 * @param props.onViewModeChange - Callback when a tab is clicked to change view mode
 * @returns A tab navigation component with visual active state
 */
export function ViewTabs({ viewMode, onViewModeChange }: ViewTabsProps) {
  return (
    <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onViewModeChange('repos')}
        className={`px-4 py-2 font-medium transition-colors ${
          viewMode === 'repos'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        📁 Repositories
      </button>
      <button
        onClick={() => onViewModeChange('developers')}
        className={`px-4 py-2 font-medium transition-colors ${
          viewMode === 'developers'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        👥 Developers
      </button>
    </div>
  );
}
