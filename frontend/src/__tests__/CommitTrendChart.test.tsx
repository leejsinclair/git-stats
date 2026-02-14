import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { CommitTrendChart } from '../components/charts/CommitTrendChart';
import type { WeeklyStats } from '../types';

describe('CommitTrendChart', () => {
  const mockData: WeeklyStats[] = [
    {
      weekStart: '2024-01-01',
      weekNumber: 1,
      year: 2024,
      commits: 10,
      linesAdded: 100,
      linesRemoved: 50,
      authors: ['dev1', 'dev2'],
      filesChanged: 20,
      commitHashes: ['abc123'],
    },
    {
      weekStart: '2024-01-08',
      weekNumber: 2,
      year: 2024,
      commits: 15,
      linesAdded: 200,
      linesRemoved: 75,
      authors: ['dev1'],
      filesChanged: 30,
      commitHashes: ['def456'],
    },
  ];

  it('should render with default title', () => {
    render(<CommitTrendChart data={mockData} />);
    expect(screen.getByText('Commit Trend Over Time')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<CommitTrendChart data={mockData} title="Custom Chart Title" />);
    expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<CommitTrendChart data={mockData} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    render(<CommitTrendChart data={[]} />);
    expect(screen.getByText('Commit Trend Over Time')).toBeInTheDocument();
  });
});
