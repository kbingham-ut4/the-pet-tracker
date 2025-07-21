# API Reference

Complete reference for Pet Tracker's internal APIs, contexts, services, and utilities.

## Context API

### PetContext

The main context provider for pet-related data and operations.

#### Provider Setup

```typescript
import { PetProvider } from '@/contexts';

function App() {
  return (
    <PetProvider>
      {/* Your app components */}
    </PetProvider>
  );
}
```

#### Hook Usage

```typescript
import { usePets } from '@/contexts';

function PetScreen() {
  const {
    pets,
    addPet,
    updatePet,
    deletePet,
    // ... other methods
  } = usePets();
}
```

#### Available Methods

##### Pet Management
- `addPet(petData)` - Add a new pet
- `updatePet(pet)` - Update existing pet
- `deletePet(petId)` - Delete a pet
- `getPetById(id)` - Get pet by ID

##### Health Records
- `addVetVisit(visitData)` - Add vet visit
- `addVaccination(vaccinationData)` - Add vaccination record
- `addActivity(activityData)` - Add activity log

##### Weight & Nutrition
- `addWeightRecord(weightData)` - Log weight measurement
- `addFoodEntry(foodData)` - Add food entry
- `updateFoodEntry(foodEntry)` - Update food entry
- `deleteFoodEntry(entryId)` - Delete food entry
- `setCalorieTarget(target)` - Set calorie goal
- `setNutritionProfile(profile)` - Set nutrition profile

##### Data Queries
- `getWeightRecordsForPet(petId)` - Get weight history
- `getFoodEntriesForPet(petId)` - Get food entries
- `getCalorieTargetForPet(petId)` - Get calorie target
- `getNutritionProfileForPet(petId)` - Get nutrition profile

## Services

### NutritionService

Static service for nutrition calculations and food database.

#### Food Database

```typescript
// Get all available foods
const foods = NutritionService.getAllFoods();

// Get nutrition for specific food
const nutrition = NutritionService.getFoodNutrition('premium_adult_dry');
// Returns: { calories: 350, protein: 25, fat: 14, carbs: 45 }
```

#### Food Entry Creation

```typescript
const foodEntry = NutritionService.createFoodEntry(
  petId,
  'Premium Adult Dry',
  100, // quantity in grams
  MealType.BREAKFAST,
  undefined, // custom calories (optional)
  undefined  // custom nutrition (optional)
);
```

#### Daily Summary

```typescript
const summary = NutritionService.calculateDailySummary(
  foodEntries,
  new Date(), // date
  2000        // calorie goal
);
// Returns: DailyNutritionSummary object
```

#### Weight Management

```typescript
// Create weight record
const weightRecord = NutritionService.createWeightRecord(
  petId,
  25.5, // weight in kg
  'Monthly weigh-in'
);

// Calculate weight trend
const trend = NutritionService.calculateWeightTrend(weightRecords);
// Returns: { trend: 'increasing' | 'decreasing' | 'stable', change: number, changePercentage: number }
```

### CalorieCalculatorFactory

Factory for creating pet-specific calorie calculators.

```typescript
// Check if calculator is supported
const isSupported = CalorieCalculatorFactory.isSupported(PetType.DOG); // true
const isSupported = CalorieCalculatorFactory.isSupported(PetType.FISH); // false

// Create calculator
const calculator = CalorieCalculatorFactory.createCalculator(PetType.DOG);

// Calculate maintenance calories
const maintenanceCalories = calculator.calculateMaintenanceCalories(
  25,                              // weight in kg
  3,                              // age in years
  ActivityLevel.MODERATELY_ACTIVE, // activity level
  true                            // spayed/neutered
);

// Calculate target calories for weight goal
const targetCalories = calculator.calculateTargetCalories(
  maintenanceCalories,
  WeightGoal.LOSE // or MAINTAIN, GAIN
);
```

## Custom Hooks

### useNutrition

Comprehensive hook for nutrition-related functionality.

```typescript
const {
  // Data
  pet,
  weightRecords,
  foodEntries,
  calorieTarget,
  nutritionProfile,
  dailySummary,
  recommendedCalories,

  // Actions
  logWeight,
  logFood,
  updateCalorieGoal,
  updateNutritionProfile,

  // Calculations
  getWeightTrend,
  calculateWeightLossPlan,

  // Utilities
  isCalorieTrackingSupported,
  commonFoods,
} = useNutrition(petId);
```

#### Methods

##### logWeight
```typescript
logWeight(weight: number, notes?: string): void
```

##### logFood
```typescript
logFood(
  foodName: string,
  quantity: number,
  mealType: MealType,
  customCalories?: number,
  customNutrition?: { protein?: number; fat?: number; carbs?: number }
): void
```

##### updateCalorieGoal
```typescript
updateCalorieGoal(
  dailyCalorieGoal: number,
  weightGoal: WeightGoal,
  targetWeight?: number
): void
```

##### updateNutritionProfile
```typescript
updateNutritionProfile(
  activityLevel: ActivityLevel,
  spayedNeutered: boolean,
  healthConditions?: string[]
): void
```

## Utilities

### Logger

Environment-aware logging utility.

```typescript
import { logger } from '@/utils';

// Log levels
logger.debug('Debug information');  // Only in development
logger.info('General information'); // When logging enabled
logger.warn('Warning message');     // Always when logging enabled
logger.error('Error occurred');     // Always when logging enabled

// Grouped logging
logger.group('API Calls');
logger.info('Making request to /api/pets');
logger.info('Request completed successfully');
logger.groupEnd();
```

### Helpers

General utility functions.

```typescript
import { formatDate, formatDateTime, generateId } from '@/utils';

// Date formatting
const dateStr = formatDate(new Date()); // "Jan 15, 2025"
const dateTimeStr = formatDateTime(new Date()); // "Jan 15, 2025, 3:45 PM"

// ID generation
const id = generateId(); // Unique string ID
```

## Configuration

### Environment Config

```typescript
import { config } from '@/config';

// Environment information
config.environment        // 'development' | 'testing' | 'staging' | 'production'
config.apiBaseUrl        // API base URL
config.apiTimeout        // Request timeout
config.enableLogging     // Logging enabled
config.enableDebugMode   // Debug mode enabled

// Feature flags
config.features.enableOfflineMode      // Offline functionality
config.features.enablePushNotifications // Push notifications
config.features.enableDataExport      // Data export feature

// Database config
config.database.name     // Database name
config.database.version  // Database version

// App constants
config.constants.maxPetPhotos        // Maximum photos per pet
config.constants.supportEmail       // Support contact
config.constants.privacyPolicyUrl   // Privacy policy URL
```

## Type Definitions

### Core Types

#### Pet
```typescript
interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  gender?: 'male' | 'female' | 'unknown';
  microchipId?: string;
  photoUri?: string;
  ownerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### WeightRecord
```typescript
interface WeightRecord {
  id: string;
  petId: string;
  weight: number; // in kilograms
  date: Date;
  notes?: string;
}
```

#### FoodEntry
```typescript
interface FoodEntry {
  id: string;
  petId: string;
  foodName: string;
  brand?: string;
  quantity: number; // in grams
  calories: number;
  protein?: number; // in grams
  fat?: number;     // in grams
  carbs?: number;   // in grams
  date: Date;
  mealType: MealType;
  notes?: string;
}
```

### Enums

#### PetType
```typescript
enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  REPTILE = 'reptile',
  OTHER = 'other',
}
```

#### ActivityLevel
```typescript
enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}
```

#### MealType
```typescript
enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  TREAT = 'treat',
}
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const calculator = CalorieCalculatorFactory.createCalculator(pet.type);
  const calories = calculator.calculateMaintenanceCalories(/* ... */);
} catch (error) {
  logger.warn('Calorie calculation not available for pet type:', pet.type);
  // Handle gracefully
}
```

### Type Guards

```typescript
function isPet(obj: any): obj is Pet {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

if (isPet(data)) {
  // TypeScript knows data is a Pet
  console.log(data.name);
}
```

This API reference provides comprehensive coverage of Pet Tracker's internal APIs for developers working on the codebase or building extensions.
