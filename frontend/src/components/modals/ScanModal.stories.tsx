import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScanModal } from './ScanModal';

const meta = {
  title: 'Components/Modals/ScanModal',
  component: ScanModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScanModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onScan: async (folder: string) => {
      console.log('Scanning folder:', folder);
      return { foundRepos: 5, successfulAnalysis: 5 };
    },
    initialFolder: '/home/user/projects',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onScan: async (folder: string) => {
      console.log('Scanning folder:', folder);
      return { foundRepos: 5, successfulAnalysis: 5 };
    },
  },
};
