import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta = {
  title: 'Components/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullwidth',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onScanClick: () => console.log('Scan button clicked'),
    onCleanupClick: () => console.log('Cleanup button clicked'),
  },
};
