import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { CommitTypeChart } from '../components/developers/detail/CommitTypeChart';
import type { CommitTypeDistribution } from '../types';

describe('CommitTypeChart', () => {
  const mockDistribution: CommitTypeDistribution = {
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
  };

  it('should render chart title', () => {
    render(<CommitTypeChart distribution={mockDistribution} />);
    expect(screen.getByText('Commit Type Distribution')).toBeInTheDocument();
  });

  it('should display bug fix ratio', () => {
    render(<CommitTypeChart distribution={mockDistribution} />);
    expect(screen.getByText('Bug Fix Ratio')).toBeInTheDocument();
    expect(screen.getByText('27.0%')).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<CommitTypeChart distribution={mockDistribution} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should handle zero bug fix ratio', () => {
    const zeroRatioDistribution: CommitTypeDistribution = {
      ...mockDistribution,
      fix: 0,
      bugFixRatio: 0,
    };
    render(<CommitTypeChart distribution={zeroRatioDistribution} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
