# Code Quality Guide

This project uses a comprehensive set of code quality tools to maintain high standards and consistency.

## 🔧 Tools Overview

### Code Formatting & Linting

- **ESLint**: TypeScript/JavaScript linting with strict rules
- **Prettier**: Consistent code formatting
- **EditorConfig**: Editor consistency across team members

### Git Hooks & Commit Standards

- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only
- **Commitlint**: Enforce conventional commit messages
- **Commitizen**: Interactive commit message creation

### Quality Checks

- **TypeScript**: Type checking
- **Vitest**: Testing framework with coverage
- **Pre-commit hooks**: Automated quality checks

## 📝 Commit Message Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

### Scopes

- `core`: Core application functionality
- `ui`: User interface components
- `navigation`: Navigation and routing
- `storage`: Data storage and persistence
- `services`: Business logic services
- `components`: Reusable components
- `hooks`: Custom React hooks
- `utils`: Utility functions
- `contexts`: React contexts
- `screens`: Screen components
- `types`: TypeScript type definitions
- `config`: Configuration files
- `tests`: Test files
- `docs`: Documentation
- `ci`: Continuous integration
- `deps`: Dependencies

### Examples

```bash
feat(storage): Add offline data synchronization
fix(ui): Resolve button alignment in pet profile
docs(api): Update service documentation
test(hooks): Add tests for useNutrition hook
```

## 🚀 Available Commands

### Quick Quality Checks

```bash
# Run all quality checks (lint, type-check, tests)
pnpm quality:check

# Fix linting and formatting issues
pnpm quality:fix

# Individual checks
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix ESLint issues
pnpm format            # Format with Prettier
pnpm format:check      # Check Prettier formatting
pnpm type-check        # TypeScript type checking
```

### Commit Tools

```bash
# Interactive commit (recommended)
pnpm commit

# Retry last commit message
pnpm commit:retry

# Regular git commit (will be validated)
git commit -m "feat: add new feature"
```

### Testing

```bash
# Run tests
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:coverage     # With coverage
pnpm test:ui           # Visual test runner
```

## 🔒 Git Hooks

### Pre-commit Hook

Automatically runs on `git commit`:

1. **lint-staged**: Lints and formats only staged files
2. **type-check**: TypeScript type checking
3. **test**: Runs tests related to changes

### Commit-msg Hook

Validates commit messages against conventional commit standards.

### Pre-push Hook

Runs comprehensive quality checks before pushing:

1. **Linting**: Full codebase lint check
2. **Type checking**: Complete TypeScript validation
3. **Testing**: Full test suite execution

## 📋 ESLint Rules

### Key Rules Enforced

- **TypeScript**: Strict type checking and best practices
- **Imports**: Consistent import organization and type imports
- **Code Style**: Object shorthand, template literals, etc.
- **Best Practices**: Prefer const, no var, strict equality
- **Console**: Warnings for console.log (allow warn/error)

### Rule Categories

- **Errors**: Code that will break or cause bugs
- **Warnings**: Code that should be improved but won't break
- **Style**: Formatting and consistency (handled by Prettier)

## 🎨 Prettier Configuration

### Settings

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing Commas**: ES5 compatible
- **Bracket Spacing**: Yes
- **Arrow Parens**: Avoid when possible

### Ignored Files

- Build outputs
- Dependencies
- Generated files
- Binary assets
- Environment files

## 🚫 Bypassing Quality Checks

### Emergency Commits

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "emergency fix"

# Skip pre-push hooks (not recommended)
git push --no-verify
```

### Disabling ESLint Rules

```typescript
// Single line disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();

// Block disable
/* eslint-disable @typescript-eslint/no-explicit-any */
const complexCode = () => {
  // Complex code that needs any types
};
/* eslint-enable @typescript-eslint/no-explicit-any */
```

## 🐛 Troubleshooting

### Common Issues

#### Git Hooks Not Running

```bash
# Reinstall husky
pnpm run prepare
# or
pnpm exec husky install
```

#### ESLint/Prettier Conflicts

```bash
# Fix conflicts by running prettier after eslint
pnpm lint:fix
pnpm format
```

#### TypeScript Errors

```bash
# Check for type errors
pnpm type-check

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
```

#### Commit Message Rejected

```bash
# Use interactive commit tool
pnpm commit

# Check commit message format
# Ensure: type(scope): description
```

### VS Code Integration

Install recommended extensions:

- ESLint
- Prettier
- EditorConfig
- Conventional Commits

Settings will be automatically applied from `.vscode/settings.json`.

## 📊 Quality Metrics

### Code Coverage

- Target: >80% overall coverage
- Critical paths: >90% coverage
- New code: >85% coverage

### ESLint

- Zero errors allowed in main branch
- Warnings should be addressed promptly
- New code should not introduce warnings

### TypeScript

- Strict mode enabled
- No any types without justification
- Proper type definitions for all APIs

## 🎯 Best Practices

1. **Commit Often**: Small, focused commits with clear messages
2. **Fix Issues Early**: Address linting/type errors immediately
3. **Test Coverage**: Write tests for new features and bug fixes
4. **Documentation**: Update docs when changing behavior
5. **Code Reviews**: Use quality checks as guidance in reviews

## 🚀 CI/CD Integration

Quality checks are integrated into CI/CD:

- **Pull Requests**: All quality checks must pass
- **Main Branch**: Protected with status checks
- **Releases**: Quality gates before deployment

The same commands run locally and in CI for consistency.
