# Linting and Formatting Setup

## Installed Tools

- **ESLint**: Already configured for both backend and frontend
- **Prettier**: Code formatter with import sorting
- **Husky**: Git hooks manager
- **lint-staged**: Run linters on staged files only

## Available Commands

### Backend (root directory)
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically
npm run format        # Format code with Prettier
npm run format:check  # Check if code is formatted
```

### Frontend (frontend directory)
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically
npm run format        # Format code with Prettier
npm run format:check  # Check if code is formatted
```

## Pre-commit Hook

Husky is configured to run `lint-staged` on every commit, which will:
- Run ESLint with auto-fix on staged `.ts` and `.tsx` files
- Run Prettier to format staged files
- Only commit if all checks pass

## Format All Files Now

To format all existing files:

```bash
# Backend
npm run format

# Frontend
cd frontend && npm run format
```

## Configuration Files

- `.prettierrc` - Prettier configuration (100 char width, single quotes, etc.)
- `.prettierignore` - Files to ignore
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - lint-staged configuration
