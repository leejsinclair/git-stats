import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeveloperHeader } from './DeveloperHeader';

const meta = {
  title: 'Developers/Detail/DeveloperHeader',
  component: DeveloperHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeveloperHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    totalCommits: 245,
    onBack: () => console.log('Back clicked'),
  },
};

export const HighActivityDeveloper: Story = {
  args: {
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    totalCommits: 1523,
    onBack: () => console.log('Back clicked'),
  },
};

export const NewDeveloper: Story = {
  args: {
    name: 'Alex Johnson',
    email: 'alex.j@startup.io',
    totalCommits: 12,
    onBack: () => console.log('Back clicked'),
  },
};
