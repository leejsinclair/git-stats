import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/layout/Header';

describe('Header', () => {
  it('should render the title and description', () => {
    const onScanClick = vi.fn();
    const onCleanupClick = vi.fn();

    render(<Header onScanClick={onScanClick} onCleanupClick={onCleanupClick} />);

    expect(screen.getByText(/Git Statistics Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Analyze and visualize Git repository statistics/i)).toBeInTheDocument();
  });

  it('should render scan and cleanup buttons', () => {
    const onScanClick = vi.fn();
    const onCleanupClick = vi.fn();

    render(<Header onScanClick={onScanClick} onCleanupClick={onCleanupClick} />);

    expect(screen.getByRole('button', { name: /scan folder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cleanup/i })).toBeInTheDocument();
  });

  it('should call onScanClick when scan button is clicked', async () => {
    const user = userEvent.setup();
    const onScanClick = vi.fn();
    const onCleanupClick = vi.fn();

    render(<Header onScanClick={onScanClick} onCleanupClick={onCleanupClick} />);

    const scanButton = screen.getByRole('button', { name: /scan folder/i });
    await user.click(scanButton);

    expect(onScanClick).toHaveBeenCalledTimes(1);
  });

  it('should call onCleanupClick when cleanup button is clicked', async () => {
    const user = userEvent.setup();
    const onScanClick = vi.fn();
    const onCleanupClick = vi.fn();

    render(<Header onScanClick={onScanClick} onCleanupClick={onCleanupClick} />);

    const cleanupButton = screen.getByRole('button', { name: /cleanup/i });
    await user.click(cleanupButton);

    expect(onCleanupClick).toHaveBeenCalledTimes(1);
  });
});
