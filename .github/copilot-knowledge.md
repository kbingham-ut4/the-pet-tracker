# Copilot Knowledge Base - Pet Tracker

This file contains project-specific knowledge and context to help GitHub Copilot provide better suggestions.

## Project Architecture

### Storage Layer

The app uses a custom storage abstraction with multiple providers:

- `AsyncStorageProvider` - For local device storage
- `GraphQLSyncProvider` - For server synchronization (future)
- `StorageManager` - Main interface for all storage operations

### Service Layer

Business logic is organized into services:

- `CalorieCalculator` - Pet calorie calculations
- `NutritionService` - Food and nutrition management
- `PetStorageService` - Pet data persistence

### Context Providers

- `PetContext` - Global pet state management
- Theme context for consistent styling

## Data Models

### Pet Interface

```typescript
interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  birthDate: Date;
  weight: number;
  activityLevel: 'low' | 'moderate' | 'high';
  profileImage?: string;
  healthScore: number;
  lastWeightUpdate: Date;
}
```

### Nutrition Entry

```typescript
interface NutritionEntry {
  id: string;
  petId: string;
  foodName: string;
  quantity: number;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  nutrition: {
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
  };
}
```

## Common Patterns

### Error Handling Pattern

```typescript
export class PetTrackerError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PetTrackerError';
  }
}
```

### Async Operation Pattern

```typescript
async function withRetry<T>(operation: () => Promise<T>, retries: number = 3): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}
```

### Custom Hook Pattern

```typescript
export function useAsyncOperation<T>(operation: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const runOperation = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    runOperation();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}
```

## Styling Conventions

### Theme Structure

```typescript
export const Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#3C3C43',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 22, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};
```

### Component Styling Pattern

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

## Testing Utilities

### Custom Test Utilities

```typescript
export const renderWithContext = (
  component: React.ReactElement,
  contextValue: Partial<PetContextType> = {}
) => {
  const defaultValue: PetContextType = {
    pets: [],
    addPet: vi.fn(),
    updatePet: vi.fn(),
    deletePet: vi.fn(),
    ...contextValue,
  };

  return render(
    <PetContext.Provider value={defaultValue}>
      {component}
    </PetContext.Provider>
  );
};
```

### Mock Data Factories

```typescript
export const createMockPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 'test-pet-id',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  birthDate: new Date('2020-01-01'),
  weight: 25,
  activityLevel: 'moderate',
  healthScore: 85,
  lastWeightUpdate: new Date(),
  ...overrides,
});
```

## Navigation Structure

### Screen Hierarchy

```
TabNavigator
├── HomeScreen (Dashboard)
├── PetsScreen (Pet Management)
├── HealthScreen (Health Tracking)
├── FoodLogScreen (Nutrition)
├── ActivitiesScreen (Activity Tracking)
└── ProfileScreen (User Settings)

StackNavigator (Modals)
├── AddPetScreen
├── PetDetailsScreen
├── WeightManagementScreen
└── HealthRecordScreen
```

### Navigation Types

```typescript
export type RootStackParamList = {
  Tabs: undefined;
  AddPet: undefined;
  PetDetails: { petId: string };
  WeightManagement: { petId: string };
  HealthRecord: { petId: string; recordId?: string };
};

export type TabParamList = {
  Home: undefined;
  Pets: undefined;
  Health: undefined;
  FoodLog: undefined;
  Activities: undefined;
  Profile: undefined;
};
```

## Environment Configuration

### Development Environments

- `development` - Local development with debug features
- `testing` - Automated testing environment
- `staging` - Pre-production testing
- `production` - Live production environment

### Environment Variables

```typescript
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
};
```

## Common Business Rules

### Calorie Calculations

- Adult dogs: 30 \* weight(kg) + 70 (for inactive)
- Multiply by activity factor: 1.2 (low), 1.5 (moderate), 1.8 (high)
- Puppies: 2-3x adult requirement depending on age
- Senior pets: 0.8-0.9x adult requirement

### Health Score Calculation

- Weight status: 30% (ideal weight = 100%)
- Activity level: 25% (meets recommendations = 100%)
- Medical history: 25% (recent checkups = higher score)
- Nutrition quality: 20% (balanced diet = higher score)

### Data Validation Rules

- Pet names: 1-50 characters, no special characters
- Weight: 0.1-200 kg for dogs, 0.1-20 kg for cats
- Age: 0-30 years maximum
- Food quantities: 1-2000g per serving

## Performance Optimizations

### List Rendering

- Use `FlatList` with `getItemLayout` when possible
- Implement `keyExtractor` for consistent keys
- Use `windowSize` and `initialNumToRender` for large lists
- Implement pull-to-refresh and infinite scrolling

### Image Handling

- Compress images before storage
- Use appropriate resolution for device
- Implement lazy loading for image galleries
- Cache images efficiently

### State Management

- Use `useMemo` for expensive calculations
- Implement `useCallback` for event handlers
- Avoid unnecessary re-renders with `React.memo`
- Use context selectors to prevent over-rendering
