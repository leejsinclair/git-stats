# Storybook Documentation

This directory contains the Storybook configuration and component stories for the Git Statistics Dashboard.

## Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook site
npm run build-storybook
```

## Viewing Components

Once Storybook is running, open your browser to http://localhost:6006 to view:

- **Component previews** - Live, interactive component examples
- **Documentation** - Auto-generated props documentation
- **Controls** - Interactive controls to modify component props
- **Actions** - Event logging for user interactions
- **Accessibility** - Automated a11y testing results

## Story Organization

Stories are organized by component category:

```
src/components/
├── charts/
│   ├── AuthorContributionChart.tsx
│   └── AuthorContributionChart.stories.tsx (coming soon)
├── developers/
│   ├── DeveloperCard.tsx
│   └── DeveloperCard.stories.tsx ✓
├── layout/
│   ├── Header.tsx
│   └── Header.stories.tsx ✓
├── modals/
│   ├── ScanModal.tsx
│   └── ScanModal.stories.tsx ✓
└── repositories/
    ├── RepoCard.tsx
    └── RepoCard.stories.tsx ✓
```

## Creating New Stories

To create a new story for a component:

1. Create a `ComponentName.stories.tsx` file next to your component
2. Import your component and Storybook types
3. Define the meta configuration
4. Export story variants

Example:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/Category/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Addons Enabled

- **@storybook/addon-docs** - Auto-generated documentation
- **@storybook/addon-a11y** - Accessibility testing
- **@chromatic-com/storybook** - Visual regression testing
- **@storybook/addon-vitest** - Component testing integration

## Best Practices

1. **Multiple Variants** - Create stories for different component states
2. **Realistic Data** - Use realistic mock data in stories
3. **Accessibility** - Check and fix a11y issues shown in the addon
4. **Documentation** - Add JSDoc comments to component props
5. **Interactivity** - Use Storybook actions to log user interactions

## Testing with Storybook

Stories can be used for:
- Visual regression testing
- Component testing
- Interaction testing
- Accessibility testing
- Documentation and design reviews
