import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { CleanupModal } from '../components/modals/CleanupModal';

describe('CleanupModal', () => {
  const mockCleanupInfo = {
    oldFilesCount: 5,
    currentFilesCount: 10,
  };

  it('should not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { container } = render(
      <CleanupModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when cleanupInfo is null', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { container } = render(
      <CleanupModal isOpen={true} onClose={onClose} onConfirm={onConfirm} cleanupInfo={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(screen.getByText('🧹 Cleanup Old Analysis Files')).toBeInTheDocument();
  });

  it('should display current files count', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(screen.getByText('Current Files')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should display old files count', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(screen.getByText('Old Files')).toBeInTheDocument();
    const oldFilesElements = screen.getAllByText('5');
    expect(oldFilesElements.length).toBeGreaterThan(0);
  });

  it('should display total files count', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should display warning message with old files count', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    expect(screen.getByText(/This will permanently delete/)).toBeInTheDocument();
    expect(screen.getByText(/old analysis file\(s\)/)).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm and onClose when Delete button is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    const deleteButton = screen.getByText('🗑️ Delete Old Files');
    deleteButton.click();

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable Delete button when oldFilesCount is 0', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={{ oldFilesCount: 0, currentFilesCount: 10 }}
      />
    );

    const deleteButton = screen.getByText('🗑️ Delete Old Files');
    expect(deleteButton).toBeDisabled();
  });

  it('should show cleaning state when Delete button is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    const deleteButton = screen.getByText('🗑️ Delete Old Files');
    deleteButton.click();

    await waitFor(() => {
      expect(screen.getByText('Cleaning...')).toBeInTheDocument();
    });
  });

  it('should disable buttons while cleaning', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    const deleteButton = screen.getByText('🗑️ Delete Old Files');
    deleteButton.click();

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      const cleaningButton = screen.getByText('Cleaning...');
      expect(cancelButton).toBeDisabled();
      expect(cleaningButton).toBeDisabled();
    });
  });

  it('should handle errors gracefully and reset cleaning state', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error('Cleanup failed'));

    render(
      <CleanupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        cleanupInfo={mockCleanupInfo}
      />
    );

    const deleteButton = screen.getByText('🗑️ Delete Old Files');
    deleteButton.click();

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      // Modal should remain open on error
      expect(onClose).not.toHaveBeenCalled();
      // Should show original button text again
      expect(screen.getByText('🗑️ Delete Old Files')).toBeInTheDocument();
    });
  });
});
