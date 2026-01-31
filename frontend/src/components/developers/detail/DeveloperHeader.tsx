interface DeveloperHeaderProps {
  name: string;
  email: string;
  totalCommits: number;
  onBack: () => void;
}

/**
 * Displays the header section for a developer detail view with name, email, and total commits.
 * 
 * @param props - Component props
 * @param props.name - Developer's display name
 * @param props.email - Developer's email address
 * @param props.totalCommits - Total number of commits made by the developer
 * @param props.onBack - Callback to navigate back to the developers list
 * @returns A header component with back button and developer information
 */
export function DeveloperHeader({ name, email, totalCommits, onBack }: DeveloperHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        ← Back to Developers
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{email}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {totalCommits}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Commits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
