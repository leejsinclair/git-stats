import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { ActivityChartsGrid } from '../components/developers/detail/ActivityChartsGrid';

describe('ActivityChartsGrid', () => {
  const mockProps = {
    dayOfWeekData: [
      { day: 'Monday', commits: 10 },
      { day: 'Tuesday', commits: 15 },
      { day: 'Wednesday', commits: 8 },
    ],
    repoData: [
      { repo: 'repo1', commits: 50 },
      { repo: 'repo2', commits: 30 },
    ],
    hourData: [
      { hour: '09:00', commits: 5 },
      { hour: '14:00', commits: 10 },
    ],
    recentActivityData: [
      { date: '2024-01-01', commits: 5, added: 100, removed: 50 },
      { date: '2024-01-02', commits: 3, added: 75, removed: 25 },
    ],
  };

  it('should render all chart titles', () => {
    render(<ActivityChartsGrid {...mockProps} />);
    expect(screen.getByText('Commits by Day of Week')).toBeInTheDocument();
    expect(screen.getByText('Repository Contributions')).toBeInTheDocument();
    expect(screen.getByText('Commits by Hour of Day')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity Trend')).toBeInTheDocument();
  });

  it('should render ResponsiveContainers for all charts', () => {
    const { container } = render(<ActivityChartsGrid {...mockProps} />);
    const responsiveContainers = container.querySelectorAll('.recharts-responsive-container');
    expect(responsiveContainers.length).toBe(4);
  });

  it('should handle empty data arrays', () => {
    const emptyProps = {
      dayOfWeekData: [],
      repoData: [],
      hourData: [],
      recentActivityData: [],
    };
    render(<ActivityChartsGrid {...emptyProps} />);
    expect(screen.getByText('Commits by Day of Week')).toBeInTheDocument();
  });
});
