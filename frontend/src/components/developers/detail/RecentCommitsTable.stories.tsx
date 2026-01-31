import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecentCommitsTable } from './RecentCommitsTable';

const meta = {
  title: 'Developers/Detail/RecentCommitsTable',
  component: RecentCommitsTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecentCommitsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCommits = [
  {
    hash: 'a1b2c3d4e5f6',
    message: 'feat(api): add user authentication endpoint',
    repo: 'backend-api',
    date: '2024-01-15T14:30:00Z',
    insertions: 145,
    deletions: 23,
  },
  {
    hash: 'b2c3d4e5f6a1',
    message: 'fix: resolve memory leak in data processing',
    repo: 'data-pipeline',
    date: '2024-01-15T10:15:00Z',
    insertions: 34,
    deletions: 67,
  },
  {
    hash: 'c3d4e5f6a1b2',
    message: 'docs(readme): update installation instructions',
    repo: 'frontend',
    date: '2024-01-14T16:45:00Z',
    insertions: 12,
    deletions: 8,
  },
  {
    hash: 'd4e5f6a1b2c3',
    message: 'refactor(auth): simplify token validation logic',
    repo: 'backend-api',
    date: '2024-01-14T11:20:00Z',
    insertions: 89,
    deletions: 112,
  },
  {
    hash: 'e5f6a1b2c3d4',
    message: 'test: add unit tests for payment service',
    repo: 'payment-service',
    date: '2024-01-13T09:30:00Z',
    insertions: 234,
    deletions: 12,
  },
];

const commitsWithIssues = [
  {
    hash: 'f6a1b2c3d4e5',
    message: 'Added new feature for user dashboard and updated the styling to match new design system.',
    repo: 'frontend',
    date: '2024-01-15T14:30:00Z',
    insertions: 245,
    deletions: 89,
  },
  {
    hash: 'a1b2c3d4e5f7',
    message: 'fixed bug.',
    repo: 'backend',
    date: '2024-01-15T10:15:00Z',
    insertions: 23,
    deletions: 45,
  },
  {
    hash: 'b2c3d4e5f6a2',
    message: 'Update documentation',
    repo: 'docs',
    date: '2024-01-14T16:45:00Z',
    insertions: 12,
    deletions: 5,
  },
];

export const WellFormattedCommits: Story = {
  args: {
    commits: sampleCommits,
    maxDisplay: 20,
  },
};

export const CommitsWithIssues: Story = {
  args: {
    commits: commitsWithIssues,
    maxDisplay: 20,
  },
};

export const LimitedDisplay: Story = {
  args: {
    commits: [...sampleCommits, ...commitsWithIssues, ...sampleCommits],
    maxDisplay: 5,
  },
};

export const MixedCommits: Story = {
  args: {
    commits: [
      ...sampleCommits.slice(0, 2),
      ...commitsWithIssues.slice(0, 1),
      ...sampleCommits.slice(2),
    ],
    maxDisplay: 20,
  },
};

export const SingleCommit: Story = {
  args: {
    commits: [sampleCommits[0]],
    maxDisplay: 20,
  },
};
