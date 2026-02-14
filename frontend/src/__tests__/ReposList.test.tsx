import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { ReposList } from '../components/repositories/ReposList';
import type { RepoMetadata } from '../types';

describe('ReposList', () => {
  const mockRepos: RepoMetadata[] = [
    {
      repoPath: '/path/to/repo1',
      repoName: 'Repo 1',
      status: 'ok',
      lastAnalyzed: '2024-01-15T10:00:00Z',
      outputFile: 'repo1.json',
      branch: 'main',
      summary: {
        totalCommits: 100,
        totalAuthors: 5,
        totalLinesAdded: 1000,
        totalLinesRemoved: 500,
        totalFilesChanged: 50,
        firstCommit: '2023-01-01T00:00:00Z',
        lastCommit: '2024-01-15T10:00:00Z',
      },
    },
    {
      repoPath: '/path/to/repo2',
      repoName: 'Repo 2',
      status: 'error',
      lastAnalyzed: '2024-01-15T10:00:00Z',
      error: 'Analysis failed',
    },
    {
      repoPath: '/path/to/repo3',
      repoName: 'Repo 3',
      status: 'analyzing',
      lastAnalyzed: '2024-01-15T10:00:00Z',
    },
  ];

  it('should render all filter buttons', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="all"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    expect(screen.getByText('All (3)')).toBeInTheDocument();
    expect(screen.getByText('✓ Analyzed (1)')).toBeInTheDocument();
    expect(screen.getByText('✗ Errors (1)')).toBeInTheDocument();
    expect(screen.getByText('⟳ Analyzing (1)')).toBeInTheDocument();
  });

  it('should highlight the active filter', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="ok"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    const analyzedButton = screen.getByText('✓ Analyzed (1)');
    expect(analyzedButton).toHaveClass('bg-green-600', 'text-white');
  });

  it('should call onFilterChange when a filter button is clicked', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="all"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    const errorButton = screen.getByText('✗ Errors (1)');
    errorButton.click();

    expect(onFilterChange).toHaveBeenCalledWith('error');
  });

  it('should render all repos when filter is "all"', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="all"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    expect(screen.getByText('Repo 1')).toBeInTheDocument();
    expect(screen.getByText('Repo 2')).toBeInTheDocument();
    expect(screen.getByText('Repo 3')).toBeInTheDocument();
  });

  it('should render only ok repos when filter is "ok"', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="ok"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    expect(screen.getByText('Repo 1')).toBeInTheDocument();
    expect(screen.queryByText('Repo 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Repo 3')).not.toBeInTheDocument();
  });

  it('should render only error repos when filter is "error"', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="error"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    expect(screen.queryByText('Repo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Repo 2')).toBeInTheDocument();
    expect(screen.queryByText('Repo 3')).not.toBeInTheDocument();
  });

  it('should render only analyzing repos when filter is "analyzing"', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="analyzing"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    expect(screen.queryByText('Repo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Repo 2')).not.toBeInTheDocument();
    expect(screen.getByText('Repo 3')).toBeInTheDocument();
  });

  it('should display "No repositories found" when filtered list is empty', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList repos={[]} filter="all" onFilterChange={onFilterChange} onRepoClick={onRepoClick} />
    );

    expect(screen.getByText('No repositories found')).toBeInTheDocument();
  });

  it('should call onRepoClick when a repo card is clicked', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList
        repos={mockRepos}
        filter="all"
        onFilterChange={onFilterChange}
        onRepoClick={onRepoClick}
      />
    );

    const repoCard = screen.getByText('Repo 1').closest('div')?.parentElement;
    repoCard?.click();

    expect(onRepoClick).toHaveBeenCalledWith(mockRepos[0]);
  });

  it('should update counts correctly for empty repos', () => {
    const onFilterChange = vi.fn();
    const onRepoClick = vi.fn();

    render(
      <ReposList repos={[]} filter="all" onFilterChange={onFilterChange} onRepoClick={onRepoClick} />
    );

    expect(screen.getByText('All (0)')).toBeInTheDocument();
    expect(screen.getByText('✓ Analyzed (0)')).toBeInTheDocument();
    expect(screen.getByText('✗ Errors (0)')).toBeInTheDocument();
    expect(screen.getByText('⟳ Analyzing (0)')).toBeInTheDocument();
  });
});
