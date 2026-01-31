import { DeveloperCard } from './DeveloperCard';
import type { DeveloperStats } from '../types';

interface DevelopersListProps {
  developers: DeveloperStats[];
  loading: boolean;
  onDeveloperClick: (developer: DeveloperStats) => void;
}

export function DevelopersList({ developers, loading, onDeveloperClick }: DevelopersListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl animate-spin inline-block">⟳</span>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading developer statistics...</p>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No developer statistics available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {developers.map(developer => (
        <DeveloperCard
          key={developer.email}
          developer={developer}
          onClick={() => onDeveloperClick(developer)}
        />
      ))}
    </div>
  );
}
