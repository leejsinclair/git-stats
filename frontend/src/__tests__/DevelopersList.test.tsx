import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { DevelopersList } from '../components/developers/DevelopersList';
import type { DeveloperStats } from '../types';

describe('DevelopersList', () => {
  const mockDeveloper: DeveloperStats = {
    name: 'John Doe',
    email: 'john@example.com',
    metrics: {
      totalCommits: 150,
      repositories: ['repo1', 'repo2'],
      linesAdded: 5000,
      linesRemoved: 2000,
      linesModified: 7000,
      documentationRatio: 15.5,
      testRatio: 22.3,
    },
    messageCompliance: {
      totalMessages: 150,
      validMessages: 120,
      passPercentage: 80,
      averageScore: 75,
      commonIssues: [],
    },
    activity: {
      totalDays: 60,
      activeDays: 45,
      averageCommitsPerDay: 3.3,
      mostActiveDay: '2024-01-15',
      commitsByDayOfWeek: {},
      commitsByHour: {},
      recentActivity: [],
    },
    commitSizeDistribution: {
      tiny: 20,
      small: 80,
      medium: 50,
      large: 20,
      huge: 10,
      averageLinesPerCommit: 50,
      medianLinesPerCommit: 40,
    },
    commitTypeDistribution: {
      feat: 50,
      fix: 40,
      docs: 10,
      style: 5,
      refactor: 20,
      perf: 5,
      test: 15,
      build: 3,
      ci: 2,
      chore: 10,
      other: 10,
      bugFixRatio: 0.27,
    },
    fileChurn: [],
    workingHoursAnalysis: {
      lateNightCommits: 10,
      weekendCommits: 20,
      businessHoursCommits: 120,
      lateNightPercentage: 6.7,
      weekendPercentage: 13.3,
      preferredWorkingHours: 'afternoon',
    },
    recentCommits: [],
  };

  it('should display loading state when loading is true', () => {
    const onDeveloperClick = vi.fn();
    render(<DevelopersList developers={[]} loading={true} onDeveloperClick={onDeveloperClick} />);

    expect(screen.getByText('Loading developer statistics...')).toBeInTheDocument();
  });

  it('should display empty state when no developers and not loading', () => {
    const onDeveloperClick = vi.fn();
    render(<DevelopersList developers={[]} loading={false} onDeveloperClick={onDeveloperClick} />);

    expect(screen.getByText('No developer statistics available')).toBeInTheDocument();
  });

  it('should render developer cards when developers are provided', () => {
    const onDeveloperClick = vi.fn();
    render(
      <DevelopersList
        developers={[mockDeveloper]}
        loading={false}
        onDeveloperClick={onDeveloperClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render multiple developer cards', () => {
    const onDeveloperClick = vi.fn();
    const developers = [
      mockDeveloper,
      {
        ...mockDeveloper,
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    ];

    render(
      <DevelopersList developers={developers} loading={false} onDeveloperClick={onDeveloperClick} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should call onDeveloperClick when a developer card is clicked', () => {
    const onDeveloperClick = vi.fn();
    render(
      <DevelopersList
        developers={[mockDeveloper]}
        loading={false}
        onDeveloperClick={onDeveloperClick}
      />
    );

    const card = screen.getByText('John Doe').closest('div');
    card?.click();

    expect(onDeveloperClick).toHaveBeenCalledWith(mockDeveloper);
  });
});
