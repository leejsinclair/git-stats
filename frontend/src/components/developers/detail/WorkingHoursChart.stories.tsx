import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkingHoursChart } from './WorkingHoursChart';

const meta = {
  title: 'Developers/Detail/WorkingHoursChart',
  component: WorkingHoursChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WorkingHoursChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HealthyWorkPattern: Story = {
  args: {
    analysis: {
      businessHoursCommits: 180,
      lateNightCommits: 20,
      weekendCommits: 30,
      lateNightPercentage: 10,
      weekendPercentage: 15,
      preferredWorkingHours: 'Morning',
    },
    totalCommits: 200,
  },
};

export const BurnoutRisk: Story = {
  args: {
    analysis: {
      businessHoursCommits: 100,
      lateNightCommits: 80,
      weekendCommits: 70,
      lateNightPercentage: 40,
      weekendPercentage: 35,
      preferredWorkingHours: 'Late Night',
    },
    totalCommits: 200,
  },
};

export const FlexibleSchedule: Story = {
  args: {
    analysis: {
      businessHoursCommits: 120,
      lateNightCommits: 45,
      weekendCommits: 40,
      lateNightPercentage: 22.5,
      weekendPercentage: 20,
      preferredWorkingHours: 'Afternoon',
    },
    totalCommits: 200,
  },
};

export const EveningWorker: Story = {
  args: {
    analysis: {
      businessHoursCommits: 60,
      lateNightCommits: 100,
      weekendCommits: 20,
      lateNightPercentage: 50,
      weekendPercentage: 10,
      preferredWorkingHours: 'Evening',
    },
    totalCommits: 200,
  },
};
