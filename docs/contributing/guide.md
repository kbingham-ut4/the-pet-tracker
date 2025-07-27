# Contributing to Pet Tracker

Thank you for your interest in contributing to Pet Tracker! This guide will help you get started with contributing to the project.

## 🎯 Ways to Contribute

### 🐛 Bug Reports

- Report bugs through [GitHub Issues](https://github.com/yourusername/pet-tracker/issues)
- Use the bug report template
- Include steps to reproduce and screenshots

### 💡 Feature Requests

- Suggest new features via [GitHub Discussions](https://github.com/yourusername/pet-tracker/discussions)
- Describe the use case and expected behavior
- Consider contributing the implementation

### 📝 Documentation

- Improve existing documentation
- Add missing documentation
- Fix typos and grammar
- Translate to other languages

### 💻 Code Contributions

- Fix bugs and implement features
- Improve performance and accessibility
- Add tests and improve code coverage
- Refactor and optimize existing code

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- React Native development environment
- Git knowledge
- TypeScript familiarity

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/pet-tracker.git
   cd pet-tracker
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/yourusername/pet-tracker.git
   ```

4. **Install dependencies**:

   ```bash
   pnpm install
   ```

5. **Set up environment**:

   ```bash
   cp .env.example .env
   ```

6. **Start development server**:
   ```bash
   pnpm start:dev
   ```

## 📋 Development Workflow

### 1. Choose an Issue

- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it
- Ask questions if you need clarification

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

### 3. Make Your Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Test your changes thoroughly

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new pet photo upload feature"
```

Use [Conventional Commits](https://conventionalcommits.org/) format:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

### 5. Stay Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 🎨 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` type; use `unknown` when necessary

```typescript
// Good
interface Pet {
  id: string;
  name: string;
  type: PetType;
}

// Avoid
const pet: any = {};
```

### React Native Components

- Use functional components with hooks
- Follow naming conventions (PascalCase for components)
- Keep components small and focused
- Use TypeScript for props and state

```typescript
interface PetCardProps {
  pet: Pet;
  onPress: (petId: string) => void;
}

export default function PetCard({ pet, onPress }: PetCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(pet.id)}>
      <Text>{pet.name}</Text>
    </TouchableOpacity>
  );
}
```

### File Organization

- Use feature-based folder structure
- Group related files together
- Use barrel exports (index.ts files)
- Follow naming conventions

```
src/
├── components/
│   ├── PetCard/
│   │   ├── PetCard.tsx
│   │   ├── PetCard.test.tsx
│   │   ├── PetCard.styles.ts
│   │   └── index.ts
│   └── index.ts
```

### Styling

- Use StyleSheet.create() for all styles
- Use design tokens from Theme.ts
- Create responsive designs
- Follow accessibility guidelines

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
});
```

### State Management

- Use Context API for global state
- Use useReducer for complex state logic
- Create custom hooks for business logic
- Keep components focused on UI

### Testing

- Write unit tests for utilities and services
- Write integration tests for complex flows
- Mock external dependencies
- Aim for good test coverage

```typescript
describe('NutritionService', () => {
  it('should calculate daily calories correctly', () => {
    const result = NutritionService.calculateDailySummary(mockFoodEntries, new Date(), 2000);
    expect(result.totalCalories).toBe(1500);
  });
});
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Test business logic thoroughly
- Mock React Navigation and Expo modules
- Use React Native Testing Library
- Write descriptive test names

### Test Structure

```typescript
describe('Component/Service Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 📱 Platform Testing

### iOS Testing

```bash
pnpm ios:dev
```

### Android Testing

```bash
pnpm android:dev
```

### Web Testing

```bash
pnpm web
```

Test your changes on all platforms before submitting a PR.

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is adequate
- [ ] Documentation is updated
- [ ] Changes tested on iOS, Android, and Web
- [ ] No console errors or warnings
- [ ] Git history is clean (squash commits if needed)

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web

## Screenshots/Videos

(If applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. **Automated checks** must pass (linting, testing, building)
2. **Code review** by maintainers
3. **Testing** on different platforms
4. **Approval** and merge by maintainers

## 🎨 Design Guidelines

### UI/UX Principles

- **Accessibility**: Support screen readers and voice control
- **Simplicity**: Keep interfaces clean and intuitive
- **Consistency**: Follow established design patterns
- **Performance**: Optimize for smooth animations and loading

### Visual Design

- Use colors from the defined Theme
- Maintain consistent spacing and typography
- Follow platform design guidelines (iOS/Android)
- Support dark/light themes

### User Experience

- Provide clear feedback for user actions
- Handle loading and error states gracefully
- Minimize required user input
- Support offline functionality

## 🐛 Bug Reporting

### Good Bug Reports Include

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Platform/device information** (iOS/Android version, device model)
- **Screenshots or videos** if applicable
- **Console logs** if relevant

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Platform (please complete):**

- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.0, Android 11]
- App Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💬 Communication

### Where to Get Help

- **GitHub Discussions** for questions and ideas
- **GitHub Issues** for bugs and feature requests
- **Code reviews** for implementation feedback

### Communication Guidelines

- Be respectful and constructive
- Search existing issues before creating new ones
- Provide context and details
- Follow up on your contributions

## 📚 Resources

### Documentation

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Tools

- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Expo DevTools](https://docs.expo.dev/workflow/debugging/)
- [ESLint](https://eslint.org/docs/user-guide/getting-started)
- [Prettier](https://prettier.io/docs/en/index.html)

## 🏆 Recognition

Contributors are recognized in:

- Project README
- Release notes
- Contributors page
- Special mentions for significant contributions

Thank you for contributing to Pet Tracker! 🐾
