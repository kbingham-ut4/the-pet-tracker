# Pet Tracker Interfaces

This folder contains comprehensive TypeScript interfaces for the Pet Tracker application, providing type safety and structure for all pet-related data.

## Overview

The interfaces are organized into several categories:

### Core Interfaces

- **`IPet`** - Main pet entity with comprehensive information
- **`IPhysicalCharacteristics`** - Pet's physical attributes
- **`IBehavioralTraits`** - Behavioral characteristics and training status
- **`IEmergencyContact`** - Emergency contact information
- **`IPetInsurance`** - Insurance policy details
- **`IHealthStatus`** - Current health status and conditions

### Veterinary Interfaces

- **`IVetVisit`** - Veterinary appointment records
- **`IVaccination`** - Vaccination records
- **`IProcedure`** - Medical procedures
- **`ITestResult`** - Laboratory test results
- **`IHealthCondition`** - Health conditions and diagnoses
- **`IMedication`** - Medication records
- **`IAllergy`** - Allergy information

### Activity & Nutrition Interfaces

- **`IActivity`** - Activity and exercise records
- **`IWeightRecord`** - Weight tracking data
- **`IFoodEntry`** - Food consumption records
- **`ICalorieTarget`** - Daily calorie goals
- **`IDailyNutritionSummary`** - Daily nutrition summaries
- **`IPetNutritionProfile`** - Nutrition preferences and restrictions

### Utility Interfaces

- **`IPetSearchCriteria`** - Search and filter criteria
- **`IPetStatistics`** - Pet health and activity statistics
- **`IPetCollection`** - Collection management with pagination
- **`IPetApiResponse`** - Standardized API responses

## Usage

### Import Individual Interfaces

```typescript
import { IPet, IVetVisit, ActivityType } from '@/interfaces';
```

### Import All Interfaces

```typescript
import * as PetInterfaces from '@/interfaces';
```

### Use Type Aliases

```typescript
import type { Pet, VetVisit, Activity } from '@/interfaces';
```

## Key Features

### 1. Comprehensive Type Safety

All interfaces provide complete type safety with optional and required fields clearly defined.

### 2. Extensible Design

Interfaces are designed to be extensible for future features without breaking existing code.

### 3. Enum Support

Comprehensive enums for all categorical data ensure consistency and prevent typos.

### 4. Documentation

All interfaces include JSDoc comments explaining their purpose and usage.

### 5. API Integration

Standardized response interfaces for consistent API communication.

## Examples

### Creating a Pet

```typescript
import { IPet, PetType, PetGender } from '@/interfaces';

const newPet: IPet = {
  id: 'pet-123',
  name: 'Buddy',
  type: PetType.DOG,
  gender: PetGender.MALE,
  dateOfBirth: new Date('2020-01-15'),
  weight: 25.5,
  createdAt: new Date(),
  updatedAt: new Date(),
  // ... other properties
};
```

### Recording a Vet Visit

```typescript
import { IVetVisit, VetVisitType } from '@/interfaces';

const vetVisit: IVetVisit = {
  id: 'visit-456',
  petId: 'pet-123',
  visitDate: new Date(),
  veterinarian: 'Dr. Smith',
  clinic: 'Happy Pets Clinic',
  reason: 'Annual checkup',
  visitType: VetVisitType.ROUTINE_CHECKUP,
  // ... other properties
};
```

### Tracking Activities

```typescript
import { IActivity, ActivityType, ActivityIntensity } from '@/interfaces';

const activity: IActivity = {
  id: 'activity-789',
  petId: 'pet-123',
  type: ActivityType.WALK,
  date: new Date(),
  duration: 30,
  distance: 2.5,
  intensity: ActivityIntensity.MODERATE,
  // ... other properties
};
```

## Best Practices

### 1. Use Consistent Naming

- Prefix interfaces with `I` (e.g., `IPet`, `IActivity`)
- Use descriptive names that clearly indicate the interface purpose
- Follow camelCase for properties and PascalCase for interfaces

### 2. Leverage Type Aliases

Use the exported type aliases for cleaner code:

```typescript
// Preferred
import type { Pet } from '@/interfaces';

// Instead of
import type { IPet } from '@/interfaces';
```

### 3. Extend Interfaces When Needed

```typescript
interface ICustomPet extends IPet {
  customField: string;
}
```

### 4. Use Enums for Categorical Data

Always use the provided enums instead of string literals:

```typescript
// Correct
pet.type = PetType.DOG;

// Incorrect
pet.type = 'dog';
```

### 5. Provide Default Values

When creating objects, provide sensible defaults:

```typescript
const defaultPet: Partial<IPet> = {
  type: PetType.DOG,
  gender: PetGender.UNKNOWN,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Migration from Existing Types

If you're migrating from the existing `Pet.ts` types:

1. Update imports:

   ```typescript
   // Old
   import { Pet, PetType } from '@/types/Pet';

   // New
   import { Pet, PetType } from '@/interfaces';
   ```

2. Interface names remain the same through type aliases
3. All enums are identical and backward compatible
4. New optional fields won't break existing code

## Contributing

When adding new interfaces:

1. Follow the established naming conventions
2. Add comprehensive JSDoc comments
3. Include relevant enums for categorical data
4. Update the index.ts file to export new interfaces
5. Add examples to this README
6. Ensure backward compatibility when modifying existing interfaces

## Future Enhancements

Planned interface additions:

- **`IBreeding`** - Breeding records and lineage
- **`IGrooming`** - Grooming appointments and care records
- **`ITraining`** - Detailed training session records
- **`IPetSitting`** - Pet sitting and boarding information
- **`IEmergencyPlan`** - Emergency care plans and protocols
