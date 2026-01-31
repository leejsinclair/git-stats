import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommitSizeChart } from './CommitSizeChart';

const meta = {
  title: 'Developers/Detail/CommitSizeChart',
  component: CommitSizeChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommitSizeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BalancedCommits: Story = {
  args: {
    distribution: {
      tiny: 45,
      small: 120,
      medium: 65,
      large: 15,
      huge: 5,
      averageLinesPerCommit: 87.5,
      medianLinesPerCommit: 62.0,
    },
  },
};

export const MostlySmallCommits: Story = {
  args: {
    distribution: {
      tiny: 80,
      small: 150,
      medium: 20,
      large: 3,
      huge: 1,
      averageLinesPerCommit: 35.2,
      medianLinesPerCommit: 28.0,
    },
  },
};

export const LargeCommits: Story = {
  args: {
    distribution: {
      tiny: 10,
      small: 30,
      medium: 40,
      large: 50,
      huge: 25,
      averageLinesPerCommit: 245.8,
      medianLinesPerCommit: 198.5,
    },
  },
};

export const OnlyTinyCommits: Story = {
  args: {
    distribution: {
      tiny: 200,
      small: 0,
      medium: 0,
      large: 0,
      huge: 0,
      averageLinesPerCommit: 6.2,
      medianLinesPerCommit: 5.0,
    },
  },
};
