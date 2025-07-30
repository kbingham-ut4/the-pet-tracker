/**
 * Pet Types - Backward Compatible Interface Exports
 *
 * This file re-exports the comprehensive interfaces as the main types
 * for backward compatibility while leveraging the new interface definitions.
 */

import type {
  IPet,
  IVetVisit,
  IVaccination,
  IActivity,
  IWeightRecord,
  IFoodEntry,
  ICalorieTarget,
  IDailyNutritionSummary,
  IPetNutritionProfile,
} from '../interfaces';

import {
  PetType as InterfacePetType,
  ActivityType as InterfaceActivityType,
  ActivityLevel as InterfaceActivityLevel,
  MealType as InterfaceMealType,
  WeightGoal as InterfaceWeightGoal,
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
  ActivityIntensity,
  WeightMeasurementMethod,
  FoodType,
  FeedingMethod,
  WeightTrend,
  PetSortOrder,
  DietaryRestrictionType,
} from '../interfaces';

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Main Pet interface - now using the comprehensive IPet interface
 */
export type Pet = IPet;

/**
 * Veterinary visit record
 */
export type VetVisit = IVetVisit;

/**
 * Vaccination record
 */
export type Vaccination = IVaccination;

/**
 * Activity record
 */
export type Activity = IActivity;

/**
 * Weight tracking record
 */
export type WeightRecord = IWeightRecord;

/**
 * Food entry record
 */
export type FoodEntry = IFoodEntry;

/**
 * Calorie target configuration
 */
export type CalorieTarget = ICalorieTarget;

/**
 * Daily nutrition summary
 */
export type DailyNutritionSummary = IDailyNutritionSummary;

/**
 * Pet nutrition profile
 */
export type PetNutritionProfile = IPetNutritionProfile;

// ============================================================================
// ENUM RE-EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Pet type enumeration - using namespace pattern to avoid redeclaration
 */
export import PetType = InterfacePetType;

/**
 * Activity type enumeration - using namespace pattern to avoid redeclaration
 */
export import ActivityType = InterfaceActivityType;

/**
 * Activity level enumeration - using namespace pattern to avoid redeclaration
 */
export import ActivityLevel = InterfaceActivityLevel;

/**
 * Meal type enumeration - using namespace pattern to avoid redeclaration
 */
export import MealType = InterfaceMealType;

/**
 * Weight goal enumeration - using namespace pattern to avoid redeclaration
 */
export import WeightGoal = InterfaceWeightGoal;

// ============================================================================
// ENHANCED ENUMS FROM NEW INTERFACES
// ============================================================================

// Export new enums not present in the original interface
export {
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
  ActivityIntensity,
  WeightMeasurementMethod,
  FoodType,
  FeedingMethod,
  WeightTrend,
  PetSortOrder,
  DietaryRestrictionType,
};
