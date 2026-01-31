import type { Meta, StoryObj } from '@storybook/react-vite';
import { OverviewStatsCard } from './OverviewStatsCard';

const meta = {
  title: 'Developers/Detail/OverviewStatsCard',
  component: OverviewStatsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OverviewStatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypicalDeveloper: Story = {
  args: {
    repositoryCount: 5,
    linesModified: 45289,
    activeDays: 123,
    averageCommitsPerDay: 2.3,
  },
};

export const HighlyActiveDeveloper: Story = {
  args: {
    repositoryCount: 12,
    linesModified: 235647,
    activeDays: 245,
    averageCommitsPerDay: 5.8,
  },
};

export const NewDeveloper: Story = {
  args: {
    repositoryCount: 2,
    linesModified: 1234,
    activeDays: 15,
    averageCommitsPerDay: 0.8,
  },
};

export const MultiProjectDeveloper: Story = {
  args: {
    repositoryCount: 25,
    linesModified: 512890,
    activeDays: 300,
    averageCommitsPerDay: 3.2,
  },
};
