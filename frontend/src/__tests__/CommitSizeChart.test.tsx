import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { CommitSizeChart } from '../components/developers/detail/CommitSizeChart';
import type { CommitSizeDistribution } from '../types';

describe('CommitSizeChart', () => {
  const mockDistribution: CommitSizeDistribution = {
    tiny: 20,
    small: 80,
    medium: 50,
    large: 20,
    huge: 10,
    averageLinesPerCommit: 55.5,
    medianLinesPerCommit: 40,
  };

  it('should render chart title', () => {
    render(<CommitSizeChart distribution={mockDistribution} />);
    expect(screen.getByText('Commit Size Distribution')).toBeInTheDocument();
  });

  it('should display average lines per commit', () => {
    render(<CommitSizeChart distribution={mockDistribution} />);
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('56 lines')).toBeInTheDocument();
  });

  it('should display median lines per commit', () => {
    render(<CommitSizeChart distribution={mockDistribution} />);
    expect(screen.getByText('Median')).toBeInTheDocument();
    expect(screen.getByText('40 lines')).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<CommitSizeChart distribution={mockDistribution} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should handle all zero distribution', () => {
    const zeroDistribution: CommitSizeDistribution = {
      tiny: 0,
      small: 0,
      medium: 0,
      large: 0,
      huge: 0,
      averageLinesPerCommit: 0,
      medianLinesPerCommit: 0,
    };
    render(<CommitSizeChart distribution={zeroDistribution} />);
    expect(screen.getByText('Commit Size Distribution')).toBeInTheDocument();
  });
});
