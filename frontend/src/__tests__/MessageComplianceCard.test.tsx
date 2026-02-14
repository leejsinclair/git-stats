import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { MessageComplianceCard } from '../components/developers/detail/MessageComplianceCard';

describe('MessageComplianceCard', () => {
  const mockProps = {
    passPercentage: 80.0,
    averageScore: 75.5,
    validMessages: 120,
    totalMessages: 150,
    commonIssues: [
      {
        rule: 'subject-case',
        count: 20,
        description: 'Subject must start with uppercase',
      },
      {
        rule: 'type-enum',
        count: 10,
        description: 'Type must be valid conventional commit type',
      },
    ],
  };

  it('should render card title', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText('Commit Message Compliance')).toBeInTheDocument();
  });

  it('should display pass percentage', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
  });

  it('should display average score', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText('75.5')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
  });

  it('should display valid messages', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Valid Messages')).toBeInTheDocument();
  });

  it('should render common issues', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText('Common Issues')).toBeInTheDocument();
    expect(screen.getByText(/Subject must start with uppercase/)).toBeInTheDocument();
    expect(screen.getByText(/Type must be valid conventional commit type/)).toBeInTheDocument();
  });

  it('should display issue counts', () => {
    render(<MessageComplianceCard {...mockProps} />);
    expect(screen.getByText(/20 times/)).toBeInTheDocument();
    expect(screen.getByText(/10 times/)).toBeInTheDocument();
  });

  it('should handle compliance with no common issues', () => {
    const propsNoIssues = {
      ...mockProps,
      commonIssues: [],
    };
    render(<MessageComplianceCard {...propsNoIssues} />);
    expect(screen.getByText('Commit Message Compliance')).toBeInTheDocument();
  });
});
