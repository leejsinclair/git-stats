import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommitTypeChart } from './CommitTypeChart';

const meta = {
  title: 'Developers/Detail/CommitTypeChart',
  component: CommitTypeChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommitTypeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BalancedDevelopment: Story = {
  args: {
    distribution: {
      feat: 45,
      fix: 25,
      refactor: 18,
      docs: 12,
      test: 15,
      chore: 8,
      style: 5,
      perf: 3,
      build: 4,
      ci: 2,
      other: 3,
      bugFixRatio: 0.25,
    },
  },
};

export const HighBugFixRatio: Story = {
  args: {
    distribution: {
      feat: 30,
      fix: 60,
      refactor: 10,
      docs: 5,
      test: 8,
      chore: 12,
      style: 2,
      perf: 1,
      build: 3,
      ci: 1,
      other: 8,
      bugFixRatio: 0.43,
    },
  },
};

export const LowBugFixRatio: Story = {
  args: {
    distribution: {
      feat: 80,
      fix: 15,
      refactor: 25,
      docs: 20,
      test: 30,
      chore: 10,
      style: 8,
      perf: 5,
      build: 4,
      ci: 3,
      other: 0,
      bugFixRatio: 0.075,
    },
  },
};

export const FeatureFocused: Story = {
  args: {
    distribution: {
      feat: 150,
      fix: 20,
      refactor: 10,
      docs: 5,
      test: 12,
      chore: 3,
      style: 0,
      perf: 0,
      build: 0,
      ci: 0,
      other: 0,
      bugFixRatio: 0.1,
    },
  },
};
