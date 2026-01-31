import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { RepoCard } from '../components/RepoCard';
import type { RepoMetadata } from '../types';

describe('RepoCard', () => {
  const mockRepo: RepoMetadata = {
    repoName: 'test-repo',
    repoPath: '/home/user/test-repo',
    branch: 'main',
    lastAnalyzed: '2024-01-15T10:00:00Z',
    status: 'ok',
    outputFile: 'test-repo-analysis.json',
  };

  it('should render repository name and path', () => {
    const onClick = vi.fn();
    render(<RepoCard repo={mockRepo} onClick={onClick} />);

    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('/home/user/test-repo')).toBeInTheDocument();
  });

  it('should display repository status', () => {
    const onClick = vi.fn();
    render(<RepoCard repo={mockRepo} onClick={onClick} />);

    expect(screen.getByText(/ok/i)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<RepoCard repo={mockRepo} onClick={onClick} />);

    const card = screen.getByText('test-repo').closest('div');
    card?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should display error message when status is error', () => {
    const errorRepo: RepoMetadata = {
      ...mockRepo,
      status: 'error',
      error: 'Failed to analyze repository',
    };
    const onClick = vi.fn();
    render(<RepoCard repo={errorRepo} onClick={onClick} />);

    expect(screen.getByText('Failed to analyze repository')).toBeInTheDocument();
  });

  it('should display branch information', () => {
    const onClick = vi.fn();
    render(<RepoCard repo={mockRepo} onClick={onClick} />);

    expect(screen.getByText(/Branch:/)).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('should display N/A when branch is not available', () => {
    const repoNoBranch: RepoMetadata = {
      ...mockRepo,
      branch: undefined,
    };
    const onClick = vi.fn();
    render(<RepoCard repo={repoNoBranch} onClick={onClick} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should format the last analyzed date', () => {
    const onClick = vi.fn();
    render(<RepoCard repo={mockRepo} onClick={onClick} />);

    expect(screen.getByText(/Last analyzed:/)).toBeInTheDocument();
  });

  it('should apply correct status color classes', () => {
    const onClick = vi.fn();
    const { container } = render(<RepoCard repo={mockRepo} onClick={onClick} />);

    const statusBadge = container.querySelector('.bg-green-100');
    expect(statusBadge).toBeInTheDocument();
  });
});
