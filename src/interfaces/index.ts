/**
 * Pet Tracker Interfaces
 * 
 * Central export point for all interface definitions
 */

// Export all pet interfaces
export * from './Pet.interface';

// Re-export commonly used types for convenience
export type {
  Pet,
  VetVisit,
  Vaccination,
  Activity,
  WeightRecord,
  FoodEntry,
  CalorieTarget,
  DailyNutritionSummary,
  PetNutritionProfile,
  PetStatistics,
  PetCollection,
  PetSearchCriteria,
} from './Pet.interface';

// Export all enums for easy access
export {
  PetType,
  PetGender,
  CoatType,
  TailType,
  EarType,
  InsuranceCoverageType,
  HealthSeverity,
  AllergyType,
  VetVisitType,
  ProcedureType,
  TestType,
  VaccineType,
  ActivityType,
  ActivityIntensity,
  WeightMeasurementMethod,
  MealType,
  FoodType,
  FeedingMethod,
  WeightGoal,
  ActivityLevel,
  DietaryRestrictionType,
  WeightTrend,
  PetSortOrder,
} from './Pet.interface';
