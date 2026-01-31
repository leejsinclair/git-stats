import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ViewTabs } from '../components/ViewTabs';

describe('ViewTabs', () => {
  it('should render both tabs', () => {
    const onViewModeChange = vi.fn();

    render(<ViewTabs viewMode="repos" onViewModeChange={onViewModeChange} />);

    expect(screen.getByText(/repositories/i)).toBeInTheDocument();
    expect(screen.getByText(/developers/i)).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    const onViewModeChange = vi.fn();
    const { rerender } = render(<ViewTabs viewMode="repos" onViewModeChange={onViewModeChange} />);

    const repoTab = screen.getByText(/repositories/i).closest('button');
    expect(repoTab).toHaveClass('text-blue-600');

    rerender(<ViewTabs viewMode="developers" onViewModeChange={onViewModeChange} />);

    const devTab = screen.getByText(/developers/i).closest('button');
    expect(devTab).toHaveClass('text-blue-600');
  });

  it('should call onViewModeChange when repositories tab is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();

    render(<ViewTabs viewMode="developers" onViewModeChange={onViewModeChange} />);

    const repoTab = screen.getByText(/repositories/i);
    await user.click(repoTab);

    expect(onViewModeChange).toHaveBeenCalledWith('repos');
  });

  it('should call onViewModeChange when developers tab is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();

    render(<ViewTabs viewMode="repos" onViewModeChange={onViewModeChange} />);

    const devTab = screen.getByText(/developers/i);
    await user.click(devTab);

    expect(onViewModeChange).toHaveBeenCalledWith('developers');
  });
});
