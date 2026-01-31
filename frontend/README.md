# Git Statistics Dashboard - Frontend

A modern React application for analyzing and visualizing Git repository statistics.

## Features

- 📊 **Repository Analysis** - Analyze Git repositories and view commit statistics
- 👥 **Developer Insights** - Track developer contributions and code quality metrics
- 📈 **Data Visualization** - Interactive charts and graphs using Recharts
- 🎨 **Modern UI** - Built with React 19, TypeScript, and Tailwind CSS
- ✅ **Well Tested** - Comprehensive test coverage with Vitest
- 📚 **Component Documentation** - Interactive Storybook documentation

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage

# Start Storybook
npm run storybook

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build Storybook
npm run build-storybook
```

## Component Documentation

View component documentation and examples in Storybook:

```bash
npm run storybook
```

Then open http://localhost:6006 in your browser.

Components are organized into categories:
- **Charts** - Data visualization components
- **Developers** - Developer statistics components
- **Layout** - Layout and navigation components
- **Modals** - Dialog and modal components
- **Repositories** - Repository management components

See [.storybook/README.md](.storybook/README.md) for more details.

## Testing

This project uses Vitest and React Testing Library for testing.

- Test files: `src/__tests__/*.test.tsx`
- Test utilities: `src/test/`
- Configuration: `vitest.config.ts`

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities
- **Storybook** - Component documentation and development

## Project Structure

```
frontend/
├── .storybook/          # Storybook configuration
├── public/              # Static assets
├── src/
│   ├── __tests__/       # Test files
│   ├── components/      # React components
│   │   ├── charts/      # Chart components
│   │   ├── developers/  # Developer components
│   │   ├── layout/      # Layout components
│   │   ├── modals/      # Modal components
│   │   └── repositories/# Repository components
│   ├── stories/         # Storybook stories
│   ├── test/            # Test utilities
│   ├── api.ts           # API client
│   ├── types.ts         # TypeScript types
│   └── App.tsx          # Main application
├── TESTING.md           # Testing documentation
└── package.json
```
import reactX from 'eslint-plugin-react-x';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
