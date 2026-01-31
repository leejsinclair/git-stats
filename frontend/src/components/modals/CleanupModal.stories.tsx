import type { Meta, StoryObj } from '@storybook/react-vite';
import { CleanupModal } from './CleanupModal';

const meta = {
  title: 'Components/Modals/CleanupModal',
  component: CleanupModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CleanupModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFiles: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onConfirm: async () => {
      console.log('Cleanup confirmed');
    },
    cleanupInfo: {
      oldFilesCount: 12,
      currentFilesCount: 7,
    },
  },
};

export const NoFiles: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onConfirm: async () => {
      console.log('Cleanup confirmed');
    },
    cleanupInfo: {
      oldFilesCount: 0,
      currentFilesCount: 7,
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onConfirm: async () => {
      console.log('Cleanup confirmed');
    },
    cleanupInfo: null,
  },
};
