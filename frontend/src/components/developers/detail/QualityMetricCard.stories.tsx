import type { Meta, StoryObj } from '@storybook/react-vite';
import { QualityMetricCard } from './QualityMetricCard';

const meta = {
  title: 'Developers/Detail/QualityMetricCard',
  component: QualityMetricCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QualityMetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExcellentDocumentation: Story = {
  args: {
    title: 'Documentation Ratio',
    icon: '📚',
    ratio: 18.5,
    thresholds: { excellent: 15, good: 10 },
    labels: {
      excellent: 'Excellent - Well documented',
      good: 'Good - Could improve',
      poor: 'Low - Needs more documentation',
    },
    helpText: 'Includes commits with docs:, README, or documentation keywords',
  },
};

export const GoodDocumentation: Story = {
  args: {
    title: 'Documentation Ratio',
    icon: '📚',
    ratio: 12.3,
    thresholds: { excellent: 15, good: 10 },
    labels: {
      excellent: 'Excellent - Well documented',
      good: 'Good - Could improve',
      poor: 'Low - Needs more documentation',
    },
    helpText: 'Includes commits with docs:, README, or documentation keywords',
  },
};

export const PoorDocumentation: Story = {
  args: {
    title: '📚 Documentation Ratio',
    icon: '📚',
    ratio: 5.2,
    thresholds: { excellent: 15, good: 10 },
    labels: {
      excellent: 'Excellent - Well documented',
      good: 'Good - Could improve',
      poor: 'Low - Needs more documentation',
    },
    helpText: 'Includes commits with docs:, README, or documentation keywords',
  },
};

export const ExcellentTestCoverage: Story = {
  args: {
    title: 'Test Coverage Ratio',
    icon: '🧪',
    ratio: 25.8,
    thresholds: { excellent: 20, good: 10 },
    labels: {
      excellent: 'Excellent - Strong testing culture',
      good: 'Good - Room for improvement',
      poor: 'Low - Consider adding more tests',
    },
    helpText: 'Includes commits with test:, spec, or testing keywords',
  },
};

export const GoodTestCoverage: Story = {
  args: {
    title: 'Test Coverage Ratio',
    icon: '🧪',
    ratio: 14.2,
    thresholds: { excellent: 20, good: 10 },
    labels: {
      excellent: 'Excellent - Strong testing culture',
      good: 'Good - Room for improvement',
      poor: 'Low - Consider adding more tests',
    },
    helpText: 'Includes commits with test:, spec, or testing keywords',
  },
};

export const PoorTestCoverage: Story = {
  args: {
    title: 'Test Coverage Ratio',
    icon: '🧪',
    ratio: 3.5,
    thresholds: { excellent: 20, good: 10 },
    labels: {
      excellent: 'Excellent - Strong testing culture',
      good: 'Good - Room for improvement',
      poor: 'Low - Consider adding more tests',
    },
    helpText: 'Includes commits with test:, spec, or testing keywords',
  },
};
