import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { DeveloperHeader } from '../components/developers/detail/DeveloperHeader';

describe('DeveloperHeader', () => {
  it('should render developer name', () => {
    const onBack = vi.fn();
    render(
      <DeveloperHeader
        name="John Doe"
        email="john@example.com"
        totalCommits={150}
        onBack={onBack}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render developer email', () => {
    const onBack = vi.fn();
    render(
      <DeveloperHeader
        name="John Doe"
        email="john@example.com"
        totalCommits={150}
        onBack={onBack}
      />
    );

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render total commits count', () => {
    const onBack = vi.fn();
    render(
      <DeveloperHeader
        name="John Doe"
        email="john@example.com"
        totalCommits={150}
        onBack={onBack}
      />
    );

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Total Commits')).toBeInTheDocument();
  });

  it('should render back button', () => {
    const onBack = vi.fn();
    render(
      <DeveloperHeader
        name="John Doe"
        email="john@example.com"
        totalCommits={150}
        onBack={onBack}
      />
    );

    expect(screen.getByText('← Back to Developers')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(
      <DeveloperHeader
        name="John Doe"
        email="john@example.com"
        totalCommits={150}
        onBack={onBack}
      />
    );

    const backButton = screen.getByText('← Back to Developers');
    backButton.click();

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
