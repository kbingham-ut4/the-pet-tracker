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
 * Pet type enumeration
 */
export const PetType = InterfacePetType;
export type PetType = InterfacePetType;

/**
 * Activity type enumeration
 */
export const ActivityType = InterfaceActivityType;
export type ActivityType = InterfaceActivityType;

/**
 * Activity level enumeration
 */
export const ActivityLevel = InterfaceActivityLevel;
export type ActivityLevel = InterfaceActivityLevel;

/**
 * Meal type enumeration
 */
export const MealType = InterfaceMealType;
export type MealType = InterfaceMealType;

/**
 * Weight goal enumeration
 */
export const WeightGoal = InterfaceWeightGoal;
export type WeightGoal = InterfaceWeightGoal;

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
