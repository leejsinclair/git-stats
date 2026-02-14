import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { QualityMetricCard } from '../components/developers/detail/QualityMetricCard';

describe('QualityMetricCard', () => {
  const mockProps = {
    title: 'Documentation Coverage',
    icon: '📚',
    ratio: 15.5,
    thresholds: {
      excellent: 20,
      good: 10,
    },
    labels: {
      excellent: 'Excellent',
      good: 'Good',
      poor: 'Needs Improvement',
    },
    helpText: 'Percentage of commits related to documentation',
  };

  it('should render card title with icon', () => {
    render(<QualityMetricCard {...mockProps} />);
    expect(screen.getByText(/📚/)).toBeInTheDocument();
    expect(screen.getByText(/Documentation Coverage/)).toBeInTheDocument();
  });

  it('should display ratio percentage', () => {
    render(<QualityMetricCard {...mockProps} />);
    expect(screen.getByText('15.5%')).toBeInTheDocument();
  });

  it('should display status label for good threshold', () => {
    render(<QualityMetricCard {...mockProps} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('should display excellent status when above excellent threshold', () => {
    render(<QualityMetricCard {...mockProps} ratio={25} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('should display poor status when below good threshold', () => {
    render(<QualityMetricCard {...mockProps} ratio={5} />);
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('should display help text', () => {
    render(<QualityMetricCard {...mockProps} />);
    expect(screen.getByText(/Percentage of commits related to documentation/)).toBeInTheDocument();
  });

  it('should render with zero values', () => {
    render(<QualityMetricCard {...mockProps} ratio={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });
});
