import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { OverviewStatsCard } from '../components/developers/detail/OverviewStatsCard';

describe('OverviewStatsCard', () => {
  const mockStats = {
    repositoryCount: 3,
    linesModified: 7000,
    activeDays: 45,
    averageCommitsPerDay: 3.3,
  };

  it('should render card title', () => {
    render(<OverviewStatsCard {...mockStats} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should display repository count', () => {
    render(<OverviewStatsCard {...mockStats} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();
  });

  it('should display lines modified', () => {
    render(<OverviewStatsCard {...mockStats} />);
    expect(screen.getByText('7,000')).toBeInTheDocument();
    expect(screen.getByText('Lines Modified')).toBeInTheDocument();
  });

  it('should display active days', () => {
    render(<OverviewStatsCard {...mockStats} />);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Active Days')).toBeInTheDocument();
  });

  it('should display average commits per day', () => {
    render(<OverviewStatsCard {...mockStats} />);
    expect(screen.getByText('3.3')).toBeInTheDocument();
    expect(screen.getByText('Avg Commits/Day')).toBeInTheDocument();
  });
});
