import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { DeveloperCard } from '../components/DeveloperCard';
import type { DeveloperStats } from '../types';

describe('DeveloperCard', () => {
  const mockDeveloper: DeveloperStats = {
    name: 'John Doe',
    email: 'john@example.com',
    metrics: {
      totalCommits: 150,
      repositories: ['repo1', 'repo2', 'repo3'],
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

  it('should render developer name and email', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display total commits count', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('commits')).toBeInTheDocument();
  });

  it('should display number of repositories', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    const card = screen.getByText('John Doe').closest('div');
    card?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should display active days', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    expect(screen.getByText('Active Days')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('should display message compliance pass rate', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    // The component formats as "80.0%", not "80%"
    expect(screen.getByText(/80\.0%/)).toBeInTheDocument();
  });

  it('should display documentation and test ratios', () => {
    const onClick = vi.fn();
    render(<DeveloperCard developer={mockDeveloper} onClick={onClick} />);

    expect(screen.getByText('15.5%')).toBeInTheDocument();
    expect(screen.getByText('22.3%')).toBeInTheDocument();
  });
});
