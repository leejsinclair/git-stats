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
      return { scanId: 'mock-scan-id-001' };
    },
    onScanComplete: () => console.log('Scan complete'),
    initialFolder: '/home/user/projects',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onScan: async (folder: string) => {
      console.log('Scanning folder:', folder);
      return { scanId: 'mock-scan-id-002' };
    },
    onScanComplete: () => console.log('Scan complete'),
  },
};
