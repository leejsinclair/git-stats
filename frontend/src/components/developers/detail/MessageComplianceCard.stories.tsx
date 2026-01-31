import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageComplianceCard } from './MessageComplianceCard';

const meta = {
  title: 'Developers/Detail/MessageComplianceCard',
  component: MessageComplianceCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageComplianceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExcellentCompliance: Story = {
  args: {
    passPercentage: 95.5,
    averageScore: 9.2,
    validMessages: 191,
    totalMessages: 200,
    commonIssues: [
      {
        rule: 'subject-max-length',
        description: 'Subject line too long',
        count: 5,
      },
      {
        rule: 'body-max-line-length',
        description: 'Body line exceeds 72 characters',
        count: 3,
      },
    ],
  },
};

export const GoodCompliance: Story = {
  args: {
    passPercentage: 78.5,
    averageScore: 7.4,
    validMessages: 157,
    totalMessages: 200,
    commonIssues: [
      {
        rule: 'subject-case',
        description: 'Subject not properly capitalized',
        count: 25,
      },
      {
        rule: 'subject-max-length',
        description: 'Subject line too long',
        count: 18,
      },
      {
        rule: 'type-enum',
        description: 'Invalid commit type',
        count: 12,
      },
    ],
  },
};

export const PoorCompliance: Story = {
  args: {
    passPercentage: 45.2,
    averageScore: 4.8,
    validMessages: 90,
    totalMessages: 200,
    commonIssues: [
      {
        rule: 'subject-case',
        description: 'Subject not properly capitalized',
        count: 58,
      },
      {
        rule: 'subject-max-length',
        description: 'Subject line too long',
        count: 42,
      },
      {
        rule: 'type-enum',
        description: 'Invalid commit type',
        count: 35,
      },
      {
        rule: 'subject-full-stop',
        description: 'Subject ends with period',
        count: 28,
      },
      {
        rule: 'body-max-line-length',
        description: 'Body line exceeds 72 characters',
        count: 22,
      },
    ],
  },
};

export const NoIssues: Story = {
  args: {
    passPercentage: 100,
    averageScore: 10,
    validMessages: 150,
    totalMessages: 150,
    commonIssues: [],
  },
};
