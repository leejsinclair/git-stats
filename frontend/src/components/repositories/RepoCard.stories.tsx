import type { Meta, StoryObj } from '@storybook/react-vite';
import { RepoCard } from './RepoCard';

const meta = {
  title: 'Components/Repositories/RepoCard',
  component: RepoCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RepoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    repo: {
      repoName: 'my-awesome-project',
      repoPath: '/home/user/projects/my-awesome-project',
      branch: 'main',
      lastAnalyzed: '2024-01-15T10:30:00Z',
      status: 'ok',
      outputFile: 'my-awesome-project-analysis.json',
      summary: {
        totalCommits: 842,
        totalAuthors: 12,
        totalLinesAdded: 15432,
        totalLinesRemoved: 9321,
        totalFilesChanged: 1034,
        firstCommit: '2021-05-02T10:30:00Z',
        lastCommit: '2024-01-12T09:14:00Z',
      },
    },
    onClick: () => console.log('Card clicked'),
  },
};

export const Error: Story = {
  args: {
    repo: {
      repoName: 'failed-project',
      repoPath: '/home/user/projects/failed-project',
      branch: 'main',
      lastAnalyzed: '2024-01-15T10:30:00Z',
      status: 'error',
      error: 'Failed to analyze repository: Not a git repository',
      outputFile: 'failed-project-analysis.json',
    },
    onClick: () => console.log('Card clicked'),
  },
};

export const Analyzing: Story = {
  args: {
    repo: {
      repoName: 'in-progress-project',
      repoPath: '/home/user/projects/in-progress-project',
      branch: 'develop',
      lastAnalyzed: '2024-01-15T10:30:00Z',
      status: 'analyzing',
      outputFile: 'in-progress-project-analysis.json',
    },
    onClick: () => console.log('Card clicked'),
  },
};

export const NoBranch: Story = {
  args: {
    repo: {
      repoName: 'no-branch-project',
      repoPath: '/home/user/projects/no-branch-project',
      lastAnalyzed: '2024-01-15T10:30:00Z',
      status: 'ok',
      outputFile: 'no-branch-project-analysis.json',
      summary: {
        totalCommits: 120,
        totalAuthors: 4,
        totalLinesAdded: 4210,
        totalLinesRemoved: 1994,
        totalFilesChanged: 312,
        firstCommit: '2022-02-10T08:00:00Z',
        lastCommit: '2024-01-14T17:45:00Z',
      },
    },
    onClick: () => console.log('Card clicked'),
  },
};
