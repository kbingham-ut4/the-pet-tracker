---
title: Testing Guide
description: Comprehensive guide to testing the Pet Tracker application
---

# Testing Guide

## Overview

This project uses **Vitest** as the testing framework for comprehensive test coverage across all components, services, utilities, and storage layers.

## Test Structure

### Test Files Location
- All test files follow the pattern `*.test.{ts,tsx}` and are located in `__tests__` directories adjacent to the source code
- Test setup files are in `src/test/`

### Test Categories

1. **Services Tests** (`src/services/__tests__/`)
   - CalorieCalculator and CalorieCalculatorFactory
   - NutritionService with comprehensive food entry testing

2. **Storage Tests** (`src/storage/__tests__/` and subdirectories)
   - StorageManager with async operations
   - AsyncStorageProvider with React Native integration
   - GraphQLSyncProvider with mock server responses
   - PetStorageService functionality

3. **Utilities Tests** (`src/utils/__tests__/`)
   - Helper functions and utility methods
   - Logging system with multiple providers (Console, File, BetterStack)

4. **Context & Hooks** (`src/contexts/__tests__/`, `src/hooks/__tests__/`)
   - React context providers
   - Custom hooks functionality

5. **Navigation & Screens** (`src/navigation/__tests__/`, `src/screens/__tests__/`)
   - Navigation setup and routing
   - Screen component rendering

6. **Configuration** (`src/config/__tests__/`)
   - Environment configuration testing

## Running Tests

### Basic Test Commands

```bash
# Run all tests
pnpm test:run

# Run tests with coverage
pnpm test:run --coverage

# Run tests in watch mode (development)
pnpm test:watch

# Run specific test file
pnpm test:run path/to/test.file.test.ts

# Run tests matching a pattern
pnpm test:run --reporter=verbose
```

### Coverage Reports

The project maintains high test coverage across:
- **Services**: ~89% coverage with comprehensive business logic testing
- **Storage**: ~37% overall, with providers at ~87% (focused on critical paths)
- **Utilities**: ~68% with emphasis on helper functions and logging
- **Configuration**: ~86% covering environment setups

## Test Configuration

### Vitest Setup
- Configuration in `vitest.config.ts`
- Test environment configured for React Native
- Mocking setup in `src/test/setup.ts`

### Mocking Strategy
- React Native components and APIs mocked for testing
- AsyncStorage mocked for storage tests
- Navigation mocked for screen and routing tests
- HTTP requests mocked for external API calls

### Key Test Utilities
- `src/test/test-utils.ts` - Custom test utilities and helpers
- Mock factories for consistent test data
- Async test patterns for storage and service operations

## CI/CD Integration

### GitHub Actions
Tests are automatically run in CI/CD pipeline using:
- Node.js 24 with pnpm 10 (specified in `.npmrc`)
- Composite GitHub Action for setup (`/.github/actions/setup-node-pnpm/`)
- Dependency caching for faster builds
- Coverage reporting integration

### Workflows
- `tests.yml` - Main test workflow for all pull requests and pushes
- `deploy-docs.yml` - Documentation deployment with test validation

## Best Practices

### Test Writing Guidelines
1. **Descriptive test names** - Tests should clearly describe what they verify
2. **Arrange-Act-Assert pattern** - Structure tests for clarity
3. **Mock external dependencies** - Keep tests isolated and fast
4. **Test edge cases** - Cover error conditions and boundary cases
5. **Async/Promise handling** - Properly handle asynchronous operations

### Mock Patterns
```typescript
// Service mocking
vi.mock('../service', () => ({
  ServiceClass: vi.fn().mockImplementation(() => ({
    method: vi.fn().mockResolvedValue(mockData)
  }))
}));

// React Native component mocking
vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  // ... other components
}));
```

### Async Testing
```typescript
// Promise-based testing
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Timeout handling for longer operations
it('should complete within timeout', async () => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      // test assertions
      resolve();
    }, 100);
  });
}, 5000); // 5 second timeout
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure proper mocking setup in test files
2. **Async test timeouts**: Increase timeout or check for unresolved promises
3. **React Native component errors**: Verify mocking configuration in setup
4. **Coverage gaps**: Review test files to ensure all critical paths are covered

### Debug Options
```bash
# Run single test with verbose output
pnpm test:run path/to/test.test.ts --reporter=verbose

# Run tests without coverage for faster debugging
pnpm test:run --coverage=false

# Run tests with specific timeout
pnpm test:run --testTimeout=10000
```

## Future Improvements

- Increase overall test coverage, especially for screen components and navigation
- Add integration tests for complete user workflows
- Implement visual regression testing for UI components
- Add performance testing for critical operations
- Expand mock data scenarios for edge case testing
