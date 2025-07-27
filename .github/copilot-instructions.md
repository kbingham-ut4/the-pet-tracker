# GitHub Copilot Instructions for Pet Tracker

This file provides specific instructions and context for GitHub Copilot when working on the Pet Tracker mobile application.

## Project Overview

Pet Tracker is a React Native mobile application built with Expo that helps pet owners track their pets' health, nutrition, activities, and veterinary records. The app uses TypeScript, modern React patterns, and follows strict code quality standards.

## Technology Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript 5.8+
- **State Management**: React Context API
- **Navigation**: React Navigation v7
- **Testing**: Vitest with React Native Testing Library
- **Styling**: React Native StyleSheet with custom theme system
- **Storage**: AsyncStorage with custom storage abstraction layer
- **Build Tool**: Expo Application Services (EAS)
- **Package Manager**: pnpm
- **Linting**: ESLint with TypeScript and Prettier integration

## Development Server Status

**IMPORTANT**: The development server is already running via `pnpm run start:dev`.

**DO NOT** start or restart the development server unless explicitly requested by the user. The server is persistent and does not need to be restarted for most code changes as it supports hot reloading.

Available development scripts:

- `pnpm start:dev` - Development server with tunnel (ALREADY RUNNING)
- `pnpm start` - Standard development server
- `pnpm android:dev` - Run on Android with dev environment
- `pnpm ios:dev` - Run on iOS with dev environment

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Define explicit types for all props, state, and function parameters
- Use interfaces over type aliases for object shapes
- Prefer `const assertions` and `as const` for immutable data
- Use generic types appropriately for reusable components

### React Native Components

- Use functional components with React hooks
- Implement proper prop validation with TypeScript interfaces
- Use meaningful component and prop names
- Follow the component structure: imports, types, component, styles
- Use React.memo() for performance optimization when appropriate

### File Organization

- Components in `/src/components/` with co-located tests
- Screens in `/src/screens/` with descriptive names
- Services in `/src/services/` for business logic
- Utils in `/src/utils/` for helper functions
- Types in `/src/types/` for shared TypeScript definitions
- Constants in `/src/constants/` for app-wide constants

### Naming Conventions

- **Components**: PascalCase (e.g., `PetProfileCard`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (e.g., `calculateCalories`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `DEFAULT_THEME_COLORS`)
- **Types/Interfaces**: PascalCase with descriptive names

## Specific Patterns to Follow

### Error Handling

```typescript
// Use proper error boundaries and try-catch blocks
try {
  const result = await asyncOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new Error('User-friendly error message');
}
```

### Logging

```typescript
// Use the custom logger service
import { logger } from '@/logger';

logger.info('User action completed', {
  userId: user.id,
  action: 'create_pet',
  petId: newPet.id,
});
```

### Storage Operations

```typescript
// Use the StorageManager abstraction
import { StorageManager } from '@/storage/StorageManager';

const petData = await StorageManager.get('pets', petId);
await StorageManager.set('pets', petId, updatedPetData);
```

### Context Usage

```typescript
// Use the custom context hooks
import { usePetContext } from '@/contexts/PetContext';

const { pets, addPet, updatePet } = usePetContext();
```

## Testing Guidelines

### Test Execution

- **Always use `pnpm test:run`** when running tests programmatically
- This command runs all tests once and exits, suitable for CI/CD and verification
- Avoid using `pnpm test` which starts watch mode and blocks the terminal
- Use `pnpm test:coverage` for coverage reports when needed

### Test Structure

- Place tests in `__tests__` directories alongside source files
- Use descriptive test names that explain the behavior
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies and async operations

### Test Naming

```typescript
describe('PetNutritionService', () => {
  describe('calculateDailyCalories', () => {
    it('should calculate correct calories for adult dog with normal activity', () => {
      // Test implementation
    });
  });
});
```

## Performance Considerations

- Use `React.memo()` for expensive components
- Implement proper list virtualization for large data sets
- Optimize images and use appropriate formats
- Use lazy loading for screens and heavy components
- Implement proper caching strategies

## Security Guidelines

- Validate all user inputs
- Use secure storage for sensitive data
- Implement proper authentication flows
- Follow OWASP mobile security guidelines
- Never log sensitive information

## Accessibility

- Add proper accessibility labels and hints
- Support screen readers with semantic markup
- Ensure proper contrast ratios
- Implement keyboard navigation support
- Test with accessibility tools

## Common Anti-Patterns to Avoid

- Don't use `any` type unless absolutely necessary
- Avoid deep prop drilling - use Context or state management
- Don't mutate props or state directly
- Avoid inline styles - use StyleSheet.create()
- Don't ignore TypeScript errors or use `@ts-ignore`
- Avoid using `useEffect` without proper dependencies

## Code Generation Preferences

When generating code:

1. **Always include TypeScript types** for all functions, components, and data structures
2. **Add proper error handling** with try-catch blocks and user-friendly error messages
3. **Include logging statements** for important operations using the custom logger
4. **Write comprehensive tests** with good coverage and edge cases
5. **Follow the established folder structure** and naming conventions
6. **Add JSDoc comments** for complex functions and public APIs
7. **Include proper imports** using the established alias patterns (@/ for src/)
8. **Consider performance implications** and suggest optimizations when relevant
9. **Add accessibility features** by default (labels, hints, roles)
10. **Include proper cleanup** in useEffect hooks and event listeners

## Project-Specific Context

### Pet Data Structure

- Pets have profiles with basic info, health records, nutrition data, and activities
- Weight tracking with historical data and trend analysis
- Food logging with calorie calculation and nutritional information
- Health records including vet visits, medications, and vaccinations
- Activity tracking with duration, type, and intensity metrics

### Business Logic

- Calorie calculations based on pet size, age, activity level, and weight goals
- Health score calculations using multiple factors
- Nutrition recommendations based on pet profile and dietary restrictions
- Activity recommendations based on breed, age, and health status

## Dependencies and Libraries

When suggesting new dependencies:

- Prefer well-maintained libraries with TypeScript support
- Check compatibility with React Native and Expo
- Consider bundle size impact on mobile app performance
- Ensure licenses are compatible with the project
- Verify the library works with the current Expo SDK version

## Documentation

- Update relevant documentation when adding new features
- Include code examples in JSDoc comments
- Update the VitePress documentation for user-facing features
- Add README files for complex modules
- Keep the changelog updated with significant changes

## Commit Message Guidelines

When generating commit messages, follow the conventional commit format with these specific rules:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Rules

- **Header**: Must be ≤ 100 characters
- **Type**: Use one of: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- **Scope**: Optional, use lowercase (e.g., `auth`, `storage`, `ui`)
- **Subject**:
  - Use imperative mood ("add feature" not "added feature")
  - Don't capitalize first letter
  - No period at the end
  - Be concise and descriptive
- **Body**: Optional, explain what and why (max 120 chars per line)
- **Footer**: Optional, reference issues or breaking changes

### Examples

```
feat(auth): add biometric authentication support

fix: resolve memory leak in image cache

docs: update API documentation for storage service

chore: update dependencies to latest versions
```

### Tips for VS Code Commit Messages

- Keep the first line under 100 characters
- Use present tense, imperative mood
- Be specific about what changed
- Reference issue numbers when applicable
