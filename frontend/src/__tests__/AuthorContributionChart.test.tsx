import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { AuthorContributionChart } from '../components/charts/AuthorContributionChart';

describe('AuthorContributionChart', () => {
  const mockData = {
    'dev1@example.com': 100,
    'dev2@example.com': 75,
    'dev3@example.com': 50,
  };

  it('should render with default title', () => {
    render(<AuthorContributionChart data={mockData} />);
    expect(screen.getByText('Author Contributions')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<AuthorContributionChart data={mockData} title="Top Contributors" />);
    expect(screen.getByText('Top Contributors')).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<AuthorContributionChart data={mockData} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should handle empty data object', () => {
    render(<AuthorContributionChart data={{}} />);
    expect(screen.getByText('Author Contributions')).toBeInTheDocument();
  });
});
