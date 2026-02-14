import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { WorkingHoursChart } from '../components/developers/detail/WorkingHoursChart';
import type { WorkingHoursAnalysis } from '../types';

describe('WorkingHoursChart', () => {
  const mockAnalysis: WorkingHoursAnalysis = {
    lateNightCommits: 10,
    weekendCommits: 20,
    businessHoursCommits: 120,
    lateNightPercentage: 6.7,
    weekendPercentage: 13.3,
    preferredWorkingHours: 'afternoon',
  };
  const totalCommits = 150;

  it('should render chart title', () => {
    render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText('Working Hours Pattern')).toBeInTheDocument();
  });

  it('should display late night percentage', () => {
    render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText('Late Night')).toBeInTheDocument();
    expect(screen.getByText('6.7%')).toBeInTheDocument();
  });

  it('should display weekend percentage', () => {
    render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText('Weekend')).toBeInTheDocument();
    expect(screen.getByText('13.3%')).toBeInTheDocument();
  });

  it('should display pattern label', () => {
    render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText('Pattern')).toBeInTheDocument();
  });

  it('should display preferred working hours', () => {
    render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText(/afternoon/i)).toBeInTheDocument();
  });

  it('should render ResponsiveContainer', () => {
    const { container } = render(<WorkingHoursChart analysis={mockAnalysis} totalCommits={totalCommits} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should show burnout warning when late night percentage is high', () => {
    const highLateNightAnalysis: WorkingHoursAnalysis = {
      ...mockAnalysis,
      lateNightPercentage: 25,
      lateNightCommits: 37,
    };
    render(<WorkingHoursChart analysis={highLateNightAnalysis} totalCommits={totalCommits} />);
    expect(screen.getByText(/25.0%/)).toBeInTheDocument();
  });
});
