import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { MonthlyActivityChart } from '../components/charts/MonthlyActivityChart';
import type { MonthlyStats } from '../types';

describe('MonthlyActivityChart', () => {
  const mockData: MonthlyStats[] = [
    {
      month: '2024-01',
      commits: 50,
      linesAdded: 500,
      linesRemoved: 200,
      authors: ['dev1', 'dev2', 'dev3'],
      filesChanged: 100,
      weeks: [],
    },
    {
      month: '2024-02',
      commits: 75,
      linesAdded: 800,
      linesRemoved: 300,
      authors: ['dev1', 'dev2'],
      filesChanged: 150,
      weeks: [],
    },
  ];

  it('should render with default title', () => {
    render(<MonthlyActivityChart data={mockData} />);
    expect(screen.getByText('Monthly Activity')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<MonthlyActivityChart data={mockData} title="Custom Monthly Chart" />);
    expect(screen.getByText('Custom Monthly Chart')).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<MonthlyActivityChart data={mockData} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    render(<MonthlyActivityChart data={[]} />);
    expect(screen.getByText('Monthly Activity')).toBeInTheDocument();
  });
});
