import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ScanModal } from '../components/modals/ScanModal';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getFolderScanProgress: vi.fn(),
  },
}));

describe('ScanModal', () => {
  const mockOnClose = vi.fn();
  const mockOnScan = vi.fn();
  const mockOnScanComplete = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ScanModal
        isOpen={false}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    expect(screen.queryByText(/Scan Folder for Repositories/i)).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    expect(screen.getByText(/Scan Folder for Repositories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Folder/i })).toBeInTheDocument();
  });

  it('should render with initial folder path', () => {
    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
        initialFolder="/custom/path"
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('/custom/path');
  });

  it('should allow user to update folder path', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '/test/folder');

    expect(input.value).toBe('/test/folder');
  });

  it('should call onScan when scan button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
        initialFolder="/test/path"
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    expect(mockOnScan).toHaveBeenCalledWith('/test/path');
  });

  it('should start progress polling after scan starts', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'scanning',
      scannedCount: 5,
      foundRepos: 2,
      currentFolder: '/test/folder',
      successfulAnalysis: 0,
      failedAnalysis: 0,
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(api.getFolderScanProgress).toHaveBeenCalledWith('test-scan-id');
    });
  });

  it('should display scanning progress', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'scanning',
      scannedCount: 5,
      foundRepos: 2,
      currentFolder: '/test/folder',
      successfulAnalysis: 0,
      failedAnalysis: 0,
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Scanning folders.../i)).toBeInTheDocument();
    });
  });

  it('should display analyzing progress', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'analyzing',
      scannedCount: 10,
      foundRepos: 3,
      currentFolder: '',
      successfulAnalysis: 1,
      failedAnalysis: 0,
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Analyzing repositories.../i)).toBeInTheDocument();
    });
  });

  it('should call onScanComplete when scan completes', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'complete',
      scannedCount: 10,
      foundRepos: 3,
      currentFolder: '',
      successfulAnalysis: 3,
      failedAnalysis: 0,
      message: 'Scan complete!',
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(mockOnScanComplete).toHaveBeenCalled();
    });
  });

  it('should display error when scan fails', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'error',
      scannedCount: 5,
      foundRepos: 0,
      currentFolder: '',
      successfulAnalysis: 0,
      failedAnalysis: 0,
      error: 'Failed to scan folder',
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to scan folder/i)).toBeInTheDocument();
    });
  });

  it('should display scanned count and found repos', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'scanning',
      scannedCount: 15,
      foundRepos: 5,
      currentFolder: '/test/folder',
      successfulAnalysis: 0,
      failedAnalysis: 0,
    });

    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Folders scanned/i)).toBeInTheDocument();
      expect(screen.getByText(/Repositories found/i)).toBeInTheDocument();
      // Check the stats are displayed (numbers will be in multiple places)
      expect(screen.getAllByText('15').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    });
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    const closeButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should reset state when modal closes', async () => {
    const user = userEvent.setup({ delay: null });
    mockOnScan.mockResolvedValue({ scanId: 'test-scan-id' });
    vi.mocked(api.getFolderScanProgress).mockResolvedValue({
      scanId: 'test-scan-id',
      status: 'scanning',
      scannedCount: 5,
      foundRepos: 2,
      currentFolder: '/test/folder',
      successfulAnalysis: 0,
      failedAnalysis: 0,
    });

    const { rerender } = render(
      <ScanModal
        isOpen={true}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    // Start scan
    const scanButton = screen.getByRole('button', { name: /Scan Folder/i });
    await user.click(scanButton);

    await waitFor(() => {
      expect(screen.getByText(/Scanning folders.../i)).toBeInTheDocument();
    });

    // Close modal - state should reset
    rerender(
      <ScanModal
        isOpen={false}
        onClose={mockOnClose}
        onScan={mockOnScan}
        onScanComplete={mockOnScanComplete}
      />
    );

    // Modal should be hidden
    expect(screen.queryByText(/Scan Folder for Repositories/i)).not.toBeInTheDocument();
  });
});
