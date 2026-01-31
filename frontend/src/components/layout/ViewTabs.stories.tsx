import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewTabs } from './ViewTabs';

const meta = {
  title: 'Components/Layout/ViewTabs',
  component: ViewTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ViewTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepositoriesActive: Story = {
  args: {
    viewMode: 'repos',
    onViewModeChange: (mode) => console.log('View mode changed to:', mode),
  },
};

export const DevelopersActive: Story = {
  args: {
    viewMode: 'developers',
    onViewModeChange: (mode) => console.log('View mode changed to:', mode),
  },
};
