import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { RecentCommitsTable } from '../components/developers/detail/RecentCommitsTable';

describe('RecentCommitsTable', () => {
  const mockCommits = [
    {
      hash: 'abc123',
      date: '2024-01-15T10:00:00Z',
      message: 'feat: add new feature',
      repo: 'my-repo',
      insertions: 50,
      deletions: 10,
    },
    {
      hash: 'def456',
      date: '2024-01-14T15:30:00Z',
      message: 'fix: resolve bug',
      repo: 'another-repo',
      insertions: 5,
      deletions: 3,
    },
  ];

  it('should render table title', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    expect(screen.getByText('Recent Commits')).toBeInTheDocument();
  });

  it('should display commit type badges', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    expect(screen.getByText('feat')).toBeInTheDocument();
    expect(screen.getByText('fix')).toBeInTheDocument();
  });

  it('should display commit descriptions', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    expect(screen.getByText('add new feature')).toBeInTheDocument();
    expect(screen.getByText('resolve bug')).toBeInTheDocument();
  });

  it('should display repository names', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    expect(screen.getByText('my-repo')).toBeInTheDocument();
    expect(screen.getByText('another-repo')).toBeInTheDocument();
  });

  it('should display commit hashes', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getByText('def456')).toBeInTheDocument();
  });

  it('should display insertions and deletions', () => {
    render(<RecentCommitsTable commits={mockCommits} />);
    // The component has text like "+ 50" and "- 10"
    const additions = screen.getAllByText(/\+/);
    const deletions = screen.getAllByText(/-/);
    expect(additions.length).toBeGreaterThan(0);
    expect(deletions.length).toBeGreaterThan(0);
  });

  it('should handle empty commits array', () => {
    render(<RecentCommitsTable commits={[]} />);
    expect(screen.getByText('Recent Commits')).toBeInTheDocument();
  });

  it('should handle long commit messages', () => {
    const longMessageCommit = [
      {
        hash: 'long123',
        date: '2024-01-15T10:00:00Z',
        message: 'feat: this is a very long commit message that should be truncated',
        repo: 'my-repo',
        insertions: 50,
        deletions: 10,
      },
    ];

    render(<RecentCommitsTable commits={longMessageCommit} />);
    expect(screen.getByText('feat')).toBeInTheDocument();
    expect(
      screen.getByText('this is a very long commit message that should be truncated')
    ).toBeInTheDocument();
  });

  it('should display message compliance warnings', () => {
    const longMessageCommit = [
      {
        hash: 'long123',
        date: '2024-01-15T10:00:00Z',
        message: 'feat: this is a very long commit message that should be truncated',
        repo: 'my-repo',
        insertions: 50,
        deletions: 10,
      },
    ];

    render(<RecentCommitsTable commits={longMessageCommit} />);
    expect(screen.getByText(/Subject long/)).toBeInTheDocument();
  });
});
