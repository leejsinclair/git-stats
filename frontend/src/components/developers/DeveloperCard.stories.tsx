import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeveloperCard } from './DeveloperCard';

const meta = {
  title: 'Components/Developers/DeveloperCard',
  component: DeveloperCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeveloperCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseDeveloper = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  metrics: {
    totalCommits: 245,
    repositories: ['repo1', 'repo2', 'repo3', 'repo4'],
    linesAdded: 12500,
    linesRemoved: 4200,
    linesModified: 16700,
    documentationRatio: 18.5,
    testRatio: 25.3,
  },
  messageCompliance: {
    totalMessages: 245,
    validMessages: 220,
    passPercentage: 89.8,
    averageScore: 82.5,
    commonIssues: [],
  },
  activity: {
    totalDays: 90,
    activeDays: 65,
    averageCommitsPerDay: 3.8,
    mostActiveDay: '2024-01-15',
    commitsByDayOfWeek: {},
    commitsByHour: {},
    recentActivity: [],
  },
  commitSizeDistribution: {
    tiny: 50,
    small: 120,
    medium: 50,
    large: 20,
    huge: 5,
    averageLinesPerCommit: 68,
    medianLinesPerCommit: 45,
  },
  commitTypeDistribution: {
    feat: 80,
    fix: 60,
    docs: 20,
    style: 10,
    refactor: 30,
    perf: 8,
    test: 25,
    build: 5,
    ci: 3,
    chore: 15,
    other: 10,
    bugFixRatio: 0.24,
  },
  fileChurn: [],
  workingHoursAnalysis: {
    lateNightCommits: 15,
    weekendCommits: 30,
    businessHoursCommits: 200,
    lateNightPercentage: 6.1,
    weekendPercentage: 12.2,
    preferredWorkingHours: 'afternoon',
  },
  recentCommits: [],
};

export const HighQuality: Story = {
  args: {
    developer: baseDeveloper,
    onClick: () => console.log('Developer card clicked'),
  },
};

export const LowCompliance: Story = {
  args: {
    developer: {
      ...baseDeveloper,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      messageCompliance: {
        totalMessages: 150,
        validMessages: 75,
        passPercentage: 50,
        averageScore: 55,
        commonIssues: [],
      },
    },
    onClick: () => console.log('Developer card clicked'),
  },
};

export const LowDocumentation: Story = {
  args: {
    developer: {
      ...baseDeveloper,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      metrics: {
        ...baseDeveloper.metrics,
        documentationRatio: 5.2,
        testRatio: 8.5,
      },
    },
    onClick: () => console.log('Developer card clicked'),
  },
};

export const HighActivity: Story = {
  args: {
    developer: {
      ...baseDeveloper,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      metrics: {
        ...baseDeveloper.metrics,
        totalCommits: 850,
        linesAdded: 45000,
        linesRemoved: 18000,
        linesModified: 63000,
      },
      activity: {
        ...baseDeveloper.activity,
        activeDays: 120,
        averageCommitsPerDay: 7.1,
      },
    },
    onClick: () => console.log('Developer card clicked'),
  },
};

export const NoCompliance: Story = {
  args: {
    developer: {
      ...baseDeveloper,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      messageCompliance: undefined,
    },
    onClick: () => console.log('Developer card clicked'),
  },
};
