# Project Structure

Understanding the Pet Tracker codebase organization and architecture.

## Overview

Pet Tracker follows a feature-based architecture with clear separation of concerns:

```
pet-tracker/
├── src/                    # Source code
├── assets/                 # Static assets
├── docs/                   # Documentation (VitePress)
├── .env.*                  # Environment configurations
├── app.config.js          # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies and scripts
```

## Source Code Structure

```
src/
├── components/            # Reusable UI components
├── constants/             # App constants and themes
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
├── screens/               # Screen components
├── services/              # Business logic and external services
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and helpers
└── config/                # Environment configuration
```

## Core Directories

### 📱 Screens (`src/screens/`)

Main application screens:

- **`HomeScreen.tsx`** - Dashboard and overview
- **`PetsScreen.tsx`** - Pet management and listing
- **`HealthScreen.tsx`** - Health tracking and records
- **`FoodLogScreen.tsx`** - Nutrition and food logging
- **`WeightManagementScreen.tsx`** - Weight tracking and goals
- **`ActivitiesScreen.tsx`** - Activity logging
- **`ProfileScreen.tsx`** - User settings and app configuration

### 🧩 Components (`src/components/`)

Reusable UI components (to be developed):

```
components/
├── common/               # Generic components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── forms/               # Form components
│   ├── PetForm.tsx
│   ├── WeightForm.tsx
│   └── FoodEntryForm.tsx
└── charts/              # Data visualization
    ├── WeightChart.tsx
    └── NutritionChart.tsx
```

### 🗂️ Context (`src/contexts/`)

State management using React Context:

- **`PetContext.tsx`** - Pet data and CRUD operations
- **`index.ts`** - Context exports

### 🎣 Hooks (`src/hooks/`)

Custom React hooks for business logic:

- **`useNutrition.ts`** - Nutrition calculations and food logging
- **`index.ts`** - Hook exports

### 🛠️ Services (`src/services/`)

Business logic and external service integrations:

- **`NutritionService.ts`** - Food database and nutrition calculations
- **`CalorieCalculator.ts`** - Pet-specific calorie calculations
- **`CalorieCalculatorFactory.ts`** - Calculator factory pattern
- **`index.ts`** - Service exports

### 📐 Types (`src/types/`)

TypeScript type definitions:

- **`Pet.ts`** - Pet-related type definitions
- **`Navigation.ts`** - Navigation type definitions
- **`index.ts`** - Type exports

### 🧰 Utils (`src/utils/`)

Utility functions and helpers:

- **`helpers.ts`** - General utility functions
- **`logger.ts`** - Environment-aware logging
- **`index.ts`** - Utility exports

### ⚙️ Config (`src/config/`)

Environment and app configuration:

- **`environments.ts`** - Environment-specific settings
- **`index.ts`** - Configuration exports

### 🎨 Constants (`src/constants/`)

App-wide constants and theming:

- **`Theme.ts`** - Colors, spacing, fonts, and design tokens
- **`index.ts`** - Constants exports

### 🧭 Navigation (`src/navigation/`)

App navigation structure:

- **`RootNavigator.tsx`** - Main navigation container
- **`TabNavigator.tsx`** - Bottom tab navigation

## File Naming Conventions

### Components and Screens
- **PascalCase** for component files: `PetCard.tsx`
- **PascalCase** for screen files: `PetsScreen.tsx`
- **Component names** match file names

### Services and Utils
- **PascalCase** for service classes: `NutritionService.ts`
- **camelCase** for utility functions: `formatDate.ts`
- **PascalCase** for factory patterns: `CalorieCalculatorFactory.ts`

### Types and Interfaces
- **PascalCase** for interfaces: `Pet.ts`
- **Interface prefix** when needed: `IPetService.ts`
- **Enum naming**: `PetType`, `ActivityLevel`

### Constants and Config
- **camelCase** for configuration: `environments.ts`
- **UPPERCASE** for static constants: `API_ENDPOINTS`
- **PascalCase** for theme objects: `Theme.ts`

## Architecture Patterns

### State Management
```typescript
// Context + useReducer pattern
const [state, dispatch] = useReducer(petReducer, initialState);

// Custom hooks for business logic
const { pet, logWeight, updateCalories } = useNutrition(petId);
```

### Service Layer
```typescript
// Static service classes
export class NutritionService {
  static createFoodEntry(/* ... */) { }
  static calculateDailySummary(/* ... */) { }
}

// Factory pattern for calculators
export class CalorieCalculatorFactory {
  static createCalculator(petType: PetType) { }
}
```

### Type Safety
```typescript
// Strict typing for all data structures
interface Pet {
  id: string;
  name: string;
  type: PetType;
  // ...
}

// Generic types for reusability
type ActionType<T> = {
  type: string;
  payload: T;
};
```

## Design Principles

### 1. **Feature-First Organization**
- Group related functionality together
- Easy to locate and modify features
- Scalable as app grows

### 2. **Separation of Concerns**
- **Screens**: UI and user interaction
- **Services**: Business logic and calculations
- **Context**: State management
- **Utils**: Pure functions and helpers

### 3. **Type Safety**
- TypeScript for all code
- Strict typing enabled
- Interface-driven development

### 4. **Local-First Architecture**
- Data stored locally by default
- Offline-first functionality
- Optional cloud sync (future feature)

### 5. **Environment Awareness**
- Configuration-driven behavior
- Environment-specific features
- Easy deployment to different stages

## Adding New Features

### 1. Create Types
```typescript
// src/types/NewFeature.ts
export interface NewFeature {
  id: string;
  // ... properties
}
```

### 2. Add to Context
```typescript
// src/contexts/PetContext.tsx
interface PetState {
  // ... existing state
  newFeatures: NewFeature[];
}
```

### 3. Create Service (if needed)
```typescript
// src/services/NewFeatureService.ts
export class NewFeatureService {
  static processNewFeature() { }
}
```

### 4. Build Screen/Component
```typescript
// src/screens/NewFeatureScreen.tsx
export default function NewFeatureScreen() { }
```

### 5. Add Navigation
```typescript
// src/navigation/TabNavigator.tsx
<Tab.Screen name="NewFeature" component={NewFeatureScreen} />
```

## Best Practices

### Import Organization
```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native';

// 3. Internal imports (absolute paths)
import { Pet } from '../types';
import { usePets } from '../contexts';
import { COLORS, SPACING } from '../constants';
```

### Component Structure
```typescript
// 1. Interface definitions
interface Props {
  pet: Pet;
  onPress: () => void;
}

// 2. Component implementation
export default function PetCard({ pet, onPress }: Props) {
  // 3. State and hooks
  const [loading, setLoading] = useState(false);
  
  // 4. Event handlers
  const handlePress = () => {
    onPress();
  };
  
  // 5. Render
  return (
    <View>
      {/* JSX */}
    </View>
  );
}

// 6. Styles
const styles = StyleSheet.create({
  // ...
});
```

This structure provides a solid foundation for building scalable React Native applications with clear organization and maintainable code.
