import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityChartsGrid } from './ActivityChartsGrid';

const meta = {
  title: 'Developers/Detail/ActivityChartsGrid',
  component: ActivityChartsGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityChartsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypicalWeekPattern: Story = {
  args: {
    dayOfWeekData: [
      { day: 'Mon', commits: 42 },
      { day: 'Tue', commits: 38 },
      { day: 'Wed', commits: 45 },
      { day: 'Thu', commits: 40 },
      { day: 'Fri', commits: 35 },
      { day: 'Sat', commits: 8 },
      { day: 'Sun', commits: 5 },
    ],
    repoData: [
      { repo: 'frontend', commits: 85 },
      { repo: 'backend', commits: 62 },
      { repo: 'mobile-app', commits: 38 },
      { repo: 'api-gateway', commits: 28 },
    ],
    hourData: [
      { hour: '9:00', commits: 15 },
      { hour: '10:00', commits: 22 },
      { hour: '11:00', commits: 18 },
      { hour: '13:00', commits: 20 },
      { hour: '14:00', commits: 25 },
      { hour: '15:00', commits: 19 },
      { hour: '16:00', commits: 16 },
    ],
    recentActivityData: [
      { date: 'Jan 1', commits: 5, added: 245, removed: 89 },
      { date: 'Jan 2', commits: 8, added: 456, removed: 123 },
      { date: 'Jan 3', commits: 12, added: 678, removed: 234 },
      { date: 'Jan 4', commits: 6, added: 321, removed: 156 },
      { date: 'Jan 5', commits: 10, added: 543, removed: 187 },
    ],
  },
};

export const WeekendWarrior: Story = {
  args: {
    dayOfWeekData: [
      { day: 'Mon', commits: 12 },
      { day: 'Tue', commits: 15 },
      { day: 'Wed', commits: 10 },
      { day: 'Thu', commits: 8 },
      { day: 'Fri', commits: 18 },
      { day: 'Sat', commits: 55 },
      { day: 'Sun', commits: 48 },
    ],
    repoData: [
      { repo: 'side-project', commits: 120 },
      { repo: 'personal-blog', commits: 35 },
      { repo: 'experiments', commits: 11 },
    ],
    hourData: [
      { hour: '10:00', commits: 8 },
      { hour: '11:00', commits: 12 },
      { hour: '14:00', commits: 15 },
      { hour: '15:00', commits: 18 },
      { hour: '20:00', commits: 25 },
      { hour: '21:00', commits: 22 },
    ],
    recentActivityData: [
      { date: 'Jan 1', commits: 2, added: 89, removed: 23 },
      { date: 'Jan 2', commits: 3, added: 156, removed: 45 },
      { date: 'Jan 3', commits: 1, added: 67, removed: 12 },
      { date: 'Jan 4', commits: 15, added: 890, removed: 234 },
      { date: 'Jan 5', commits: 18, added: 1023, removed: 345 },
    ],
  },
};

export const SingleRepoFocus: Story = {
  args: {
    dayOfWeekData: [
      { day: 'Mon', commits: 35 },
      { day: 'Tue', commits: 40 },
      { day: 'Wed', commits: 38 },
      { day: 'Thu', commits: 42 },
      { day: 'Fri', commits: 30 },
      { day: 'Sat', commits: 0 },
      { day: 'Sun', commits: 0 },
    ],
    repoData: [{ repo: 'main-project', commits: 185 }],
    hourData: [
      { hour: '8:00', commits: 10 },
      { hour: '9:00', commits: 18 },
      { hour: '10:00', commits: 25 },
      { hour: '11:00', commits: 22 },
      { hour: '13:00', commits: 20 },
      { hour: '14:00', commits: 28 },
      { hour: '15:00', commits: 24 },
      { hour: '16:00', commits: 18 },
    ],
    recentActivityData: [
      { date: 'Jan 1', commits: 8, added: 345, removed: 123 },
      { date: 'Jan 2', commits: 10, added: 512, removed: 167 },
      { date: 'Jan 3', commits: 7, added: 289, removed: 98 },
      { date: 'Jan 4', commits: 9, added: 423, removed: 145 },
      { date: 'Jan 5', commits: 11, added: 598, removed: 201 },
    ],
  },
};
