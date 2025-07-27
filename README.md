# Pet Tracker

A modern mobile application built with React Native, Expo, and TypeScript to help you track your beloved pets' activities, health, and important information.

## 🐾 Features

- **Pet Management**: Add, edit, and organize information about your pets
- **Activity Tracking**: Log walks, play sessions, training, and other activities
- **Health Records**: Keep track of vet visits, vaccinations, and medical history
- **Nutrition & Weight Management**: Track feeding schedules and weight for dogs
- **Offline Storage**: Robust offline-first data storage with cloud synchronization
- **Logging System**: Comprehensive logging with pluggable providers (Console, BetterStack, File)
- **Environment Configuration**: Multi-environment setup (dev, test, staging, production)
- **Dashboard**: Overview of your pets' health and activities
- **Modern UI**: Beautiful, intuitive interface with custom themes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PNPM (recommended) or npm
- Expo CLI
- React Native development environment

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd the-pet-tracker
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm start
   ```

4. Run on your preferred platform:
   - **iOS**: `pnpm ios`
   - **Android**: `pnpm android`
   - **Web**: `pnpm web`

## � Documentation

Complete documentation for the Pet Tracker application is available online:

**🌐 [View Full Documentation](https://kbingham-ut4.github.io/the-pet-tracker/)**

The documentation includes:

- **Getting Started Guide**: Detailed setup and installation instructions
- **Development Workflow**: Best practices and development patterns
- **API Reference**: Complete API documentation for all services and utilities
- **Architecture Overview**: System design and data flow
- **Testing Guide**: Testing strategies and examples
- **Deployment Guide**: Build and deployment instructions
- **Storage System**: Offline-first storage implementation details
- **Logging System**: Comprehensive logging with multiple providers

### Local Documentation

You can also run the documentation locally:

```bash
# Start the documentation development server
pnpm docs:dev

# Build the documentation
pnpm docs:build

# Preview the built documentation
pnpm docs:preview
```

## �📱 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Environment and app configuration
├── contexts/           # React contexts for state management
├── constants/          # App constants and themes
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── services/          # API services and data management
├── storage/           # Offline-first storage system
│   ├── providers/     # Storage providers (AsyncStorage, GraphQL)
│   └── services/      # High-level storage services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    └── logging/       # Pluggable logging system
```

### Storage System

The app features a robust offline-first storage system:

- **Local Storage**: Always stores data locally first using AsyncStorage
- **Cloud Sync**: Optional synchronization with GraphQL endpoints
- **Network Resilience**: Automatic fallback to local storage when offline
- **Configurable**: Enable/disable storage features per environment
- **Event System**: Real-time notifications for storage operations

See [storage documentation](./docs/development/storage.md) for detailed usage.

### Environment Configuration

The app supports multiple environments with specific configurations:

- **Development**: Local development with console + file logging
- **Testing**: Minimal logging for automated tests
- **Staging**: Full logging with BetterStack for pre-production testing
- **Production**: Remote logging only with BetterStack

Copy `.env.example` to `.env.development` and configure your environment variables.

### Logging System

The app includes a comprehensive logging system with multiple providers:

- **ConsoleProvider**: Development debugging
- **BetterStackProvider**: Remote logging and monitoring
- **FileProvider**: Local file logging

See [logging documentation](./docs/development/logging.md) for detailed usage.

### Scripts

- `pnpm start` - Start Expo development server
- `pnpm android` - Run on Android
- `pnpm ios` - Run on iOS
- `pnpm web` - Run on web
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## 🛠 Tech Stack

- **Framework**: Expo SDK 53
- **Language**: TypeScript
- **UI**: React Native
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **Icons**: Expo Vector Icons
- **Package Manager**: PNPM
- **Code Quality**: ESLint + Prettier

## ✨ Code Quality & Development Workflow

This project enforces high code quality standards through automated tools and processes:

### 🔧 Code Quality Tools

- **ESLint**: Linting with TypeScript-specific rules and React Native best practices
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Static type checking for better code reliability
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Run quality checks only on staged files
- **Commitlint**: Conventional commit message enforcement
- **Commitizen**: Interactive commit message helper

### 🎯 Quality Scripts

```bash
# Linting
pnpm lint          # Check for linting issues
pnpm lint:fix      # Auto-fix linting issues

# Formatting
pnpm format        # Format all files
pnpm format:check  # Check if files are formatted

# Type Checking
pnpm type-check    # Run TypeScript type checking

# All Quality Checks
pnpm quality:check # Run lint + type-check + tests

# Commit Helper
pnpm commit        # Interactive commit with proper formatting
```

### 🪝 Git Hooks

Automated quality checks run at different stages:

- **pre-commit**: Runs lint-staged (linting and formatting on staged files)
- **commit-msg**: Validates commit message format using commitlint
- **pre-push**: Runs comprehensive checks (lint, type-check, tests)

### 📝 Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

body (optional)

footer (optional)
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Examples**:

```bash
feat: add pet weight tracking feature
fix(storage): resolve data sync issue
docs: update API documentation
test: add unit tests for nutrition service
```

### 🚀 GitHub Actions

Automated CI/CD workflows ensure code quality:

- **Code Quality**: Runs on all PRs - linting, type-checking, formatting checks
- **CI**: Comprehensive quality gate with tests and security audits
- **Tests**: Unit and integration test execution

### 📊 Development Workflow

1. **Create Feature Branch**: `git checkout -b feat/new-feature`
2. **Make Changes**: Write code following TypeScript and ESLint rules
3. **Commit Changes**: Use `pnpm commit` for properly formatted commits
4. **Push Changes**: Automated pre-push hooks run quality checks
5. **Create PR**: GitHub Actions run comprehensive quality and test suites
6. **Code Review**: Team reviews for logic, design, and maintainability
7. **Merge**: Squash and merge after all checks pass

### 🔍 Local Development Tips

```bash
# Check your code before committing
pnpm quality:check

# Auto-fix common issues
pnpm lint:fix && pnpm format

# Use the commit helper for proper messages
pnpm commit

# Test specific functionality
pnpm test src/services/
```

## 🎨 Design System

The app uses a custom design system with:

- Consistent color palette
- Typography scale
- Spacing system
- Border radius standards
- Component variants

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please create an issue in the repository.
