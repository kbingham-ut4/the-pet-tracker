/**
 * Pet Interface Definitions
 * 
 * Comprehensive interfaces for the Pet Tracker application
 * providing type safety and structure for all pet-related data.
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Core Pet interface representing the main pet entity
 */
export interface IPet {
  /** Unique identifier for the pet */
  id: string;
  
  /** Pet's name */
  name: string;
  
  /** Type of pet (dog, cat, etc.) */
  type: PetType;
  
  /** Pet's breed (optional) */
  breed?: string;
  
  /** Pet's age in years (legacy field, use dateOfBirth when available) */
  age?: number;
  
  /** Pet's date of birth for accurate age calculation */
  dateOfBirth?: Date;
  
  /** Pet's current weight in kilograms */
  weight?: number;
  
  /** Pet's color or coat description */
  color?: string;
  
  /** Pet's gender */
  gender?: PetGender;
  
  /** Microchip identification number */
  microchipId?: string;
  
  /** URI to pet's photo */
  photoUri?: string;
  
  /** Owner's personal notes about the pet */
  ownerNotes?: string;
  
  /** ID of the user who owns this pet */
  ownerId?: string;
  
  /** When the pet record was created */
  createdAt: Date;
  
  /** When the pet record was last updated */
  updatedAt: Date;
  
  /** Pet's physical characteristics */
  physicalCharacteristics?: IPhysicalCharacteristics;
  
  /** Pet's behavioral traits */
  behavioralTraits?: IBehavioralTraits;
  
  /** Emergency contact information */
  emergencyContact?: IEmergencyContact;
  
  /** Insurance information */
  insurance?: IPetInsurance;
  
  /** Current health status */
  healthStatus?: IHealthStatus;
}

/**
 * Pet type enumeration
 */
export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  REPTILE = 'reptile',
  OTHER = 'other',
}

/**
 * Pet gender enumeration
 */
export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

/**
 * Physical characteristics of the pet
 */
export interface IPhysicalCharacteristics {
  /** Height in centimeters */
  height?: number;
  
  /** Length in centimeters */
  length?: number;
  
  /** Eye color */
  eyeColor?: string;
  
  /** Distinctive markings or features */
  markings?: string[];
  
  /** Coat type (for furry pets) */
  coatType?: CoatType;
  
  /** Tail type */
  tailType?: TailType;
  
  /** Ear type */
  earType?: EarType;
}

export enum CoatType {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  CURLY = 'curly',
  WIRE = 'wire',
  HAIRLESS = 'hairless',
}

export enum TailType {
  LONG = 'long',
  SHORT = 'short',
  DOCKED = 'docked',
  CURLED = 'curled',
  STRAIGHT = 'straight',
}

export enum EarType {
  ERECT = 'erect',
  FLOPPY = 'floppy',
  SEMI_ERECT = 'semi_erect',
  CROPPED = 'cropped',
}

/**
 * Behavioral traits and characteristics
 */
export interface IBehavioralTraits {
  /** Energy level (1-10 scale) */
  energyLevel?: number;
  
  /** Friendliness with humans (1-10 scale) */
  humanFriendliness?: number;
  
  /** Friendliness with other pets (1-10 scale) */
  petFriendliness?: number;
  
  /** Trainability (1-10 scale) */
  trainability?: number;
  
  /** Special behaviors or quirks */
  specialBehaviors?: string[];
  
  /** Known fears or phobias */
  fears?: string[];
  
  /** Favorite activities */
  favoriteActivities?: string[];
  
  /** Training status */
  trainingStatus?: ITrainingStatus;
}

export interface ITrainingStatus {
  /** Is house trained */
  houseTrained: boolean;
  
  /** Known commands */
  knownCommands?: string[];
  
  /** Training notes */
  trainingNotes?: string;
  
  /** Last training session date */
  lastTrainingDate?: Date;
}

/**
 * Emergency contact information
 */
export interface IEmergencyContact {
  /** Contact person's name */
  name: string;
  
  /** Phone number */
  phone: string;
  
  /** Email address */
  email?: string;
  
  /** Relationship to pet owner */
  relationship: string;
  
  /** Additional notes */
  notes?: string;
}

/**
 * Pet insurance information
 */
export interface IPetInsurance {
  /** Insurance provider name */
  provider: string;
  
  /** Policy number */
  policyNumber: string;
  
  /** Coverage type */
  coverageType: InsuranceCoverageType;
  
  /** Annual deductible */
  deductible?: number;
  
  /** Coverage percentage */
  coveragePercentage?: number;
  
  /** Annual limit */
  annualLimit?: number;
  
  /** Policy start date */
  startDate: Date;
  
  /** Policy end date */
  endDate?: Date;
  
  /** Is policy active */
  isActive: boolean;
}

export enum InsuranceCoverageType {
  ACCIDENT_ONLY = 'accident_only',
  ACCIDENT_AND_ILLNESS = 'accident_and_illness',
  COMPREHENSIVE = 'comprehensive',
  WELLNESS = 'wellness',
}

/**
 * Current health status
 */
export interface IHealthStatus {
  /** Overall health rating (1-10) */
  overallHealth: number;
  
  /** Current health conditions */
  conditions?: IHealthCondition[];
  
  /** Current medications */
  medications?: IMedication[];
  
  /** Known allergies */
  allergies?: IAllergy[];
  
  /** Last vet visit date */
  lastVetVisit?: Date;
  
  /** Next scheduled visit */
  nextVetVisit?: Date;
  
  /** Is spayed/neutered */
  spayedNeutered?: boolean;
  
  /** Spay/neuter date */
  spayNeuterDate?: Date;
}

export interface IHealthCondition {
  /** Condition ID */
  id: string;
  
  /** Condition name */
  name: string;
  
  /** Severity level */
  severity: HealthSeverity;
  
  /** Date diagnosed */
  diagnosedDate: Date;
  
  /** Is condition chronic */
  isChronic: boolean;
  
  /** Treatment notes */
  treatmentNotes?: string;
  
  /** Is currently active */
  isActive: boolean;
}

export enum HealthSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export interface IMedication {
  /** Medication ID */
  id: string;
  
  /** Medication name */
  name: string;
  
  /** Dosage */
  dosage: string;
  
  /** Frequency */
  frequency: string;
  
  /** Start date */
  startDate: Date;
  
  /** End date */
  endDate?: Date;
  
  /** Administration instructions */
  instructions?: string;
  
  /** Prescribing veterinarian */
  veterinarian?: string;
  
  /** Is currently active */
  isActive: boolean;
}

export interface IAllergy {
  /** Allergy ID */
  id: string;
  
  /** Allergen name */
  allergen: string;
  
  /** Allergy type */
  type: AllergyType;
  
  /** Severity level */
  severity: HealthSeverity;
  
  /** Symptoms */
  symptoms?: string[];
  
  /** Treatment notes */
  treatmentNotes?: string;
  
  /** Date discovered */
  discoveredDate?: Date;
}

export enum AllergyType {
  FOOD = 'food',
  ENVIRONMENTAL = 'environmental',
  MEDICATION = 'medication',
  CONTACT = 'contact',
  OTHER = 'other',
}

// ============================================================================
// VETERINARY INTERFACES
// ============================================================================

/**
 * Veterinary visit record
 */
export interface IVetVisit {
  /** Visit ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Visit date */
  visitDate: Date;
  
  /** Veterinarian name */
  veterinarian: string;
  
  /** Clinic name */
  clinic: string;
  
  /** Reason for visit */
  reason: string;
  
  /** Diagnosis */
  diagnosis?: string;
  
  /** Treatment provided */
  treatment?: string;
  
  /** Medications prescribed */
  medications?: IMedication[];
  
  /** Next visit date */
  nextVisitDate?: Date;
  
  /** Visit cost */
  cost?: number;
  
  /** Additional notes */
  notes?: string;
  
  /** Visit type */
  visitType: VetVisitType;
  
  /** Procedures performed */
  procedures?: IProcedure[];
  
  /** Test results */
  testResults?: ITestResult[];
}

export enum VetVisitType {
  ROUTINE_CHECKUP = 'routine_checkup',
  VACCINATION = 'vaccination',
  ILLNESS = 'illness',
  INJURY = 'injury',
  SURGERY = 'surgery',
  DENTAL = 'dental',
  EMERGENCY = 'emergency',
  FOLLOW_UP = 'follow_up',
  OTHER = 'other',
}

export interface IProcedure {
  /** Procedure ID */
  id: string;
  
  /** Procedure name */
  name: string;
  
  /** Procedure type */
  type: ProcedureType;
  
  /** Cost */
  cost?: number;
  
  /** Duration in minutes */
  duration?: number;
  
  /** Notes */
  notes?: string;
}

export enum ProcedureType {
  EXAMINATION = 'examination',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  DENTAL_CLEANING = 'dental_cleaning',
  BLOOD_WORK = 'blood_work',
  X_RAY = 'x_ray',
  ULTRASOUND = 'ultrasound',
  OTHER = 'other',
}

export interface ITestResult {
  /** Test ID */
  id: string;
  
  /** Test name */
  testName: string;
  
  /** Test type */
  testType: TestType;
  
  /** Result value */
  result: string;
  
  /** Normal range */
  normalRange?: string;
  
  /** Is result abnormal */
  isAbnormal: boolean;
  
  /** Test date */
  testDate: Date;
  
  /** Notes */
  notes?: string;
}

export enum TestType {
  BLOOD_CHEMISTRY = 'blood_chemistry',
  COMPLETE_BLOOD_COUNT = 'complete_blood_count',
  URINALYSIS = 'urinalysis',
  FECAL_EXAM = 'fecal_exam',
  HEARTWORM_TEST = 'heartworm_test',
  THYROID_TEST = 'thyroid_test',
  OTHER = 'other',
}

/**
 * Vaccination record
 */
export interface IVaccination {
  /** Vaccination ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Vaccine name */
  vaccineName: string;
  
  /** Date administered */
  dateAdministered: Date;
  
  /** Next due date */
  nextDueDate?: Date;
  
  /** Administering veterinarian */
  veterinarian: string;
  
  /** Vaccine batch number */
  batchNumber?: string;
  
  /** Manufacturer */
  manufacturer?: string;
  
  /** Lot number */
  lotNumber?: string;
  
  /** Expiration date */
  expirationDate?: Date;
  
  /** Injection site */
  injectionSite?: string;
  
  /** Adverse reactions */
  adverseReactions?: string[];
  
  /** Notes */
  notes?: string;
  
  /** Vaccine type */
  vaccineType: VaccineType;
}

export enum VaccineType {
  CORE = 'core',
  NON_CORE = 'non_core',
  REQUIRED = 'required',
  OPTIONAL = 'optional',
}

// ============================================================================
// ACTIVITY AND NUTRITION INTERFACES
// ============================================================================

/**
 * Activity record
 */
export interface IActivity {
  /** Activity ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Activity type */
  type: ActivityType;
  
  /** Activity date */
  date: Date;
  
  /** Duration in minutes */
  duration?: number;
  
  /** Distance in kilometers */
  distance?: number;
  
  /** Location */
  location?: string;
  
  /** Calories burned */
  caloriesBurned?: number;
  
  /** Intensity level */
  intensity?: ActivityIntensity;
  
  /** Weather conditions */
  weather?: IWeatherConditions;
  
  /** Notes */
  notes?: string;
  
  /** Activity companions */
  companions?: string[];
}

export enum ActivityType {
  WALK = 'walk',
  RUN = 'run',
  PLAY = 'play',
  TRAINING = 'training',
  GROOMING = 'grooming',
  FEEDING = 'feeding',
  SWIMMING = 'swimming',
  HIKING = 'hiking',
  AGILITY = 'agility',
  OTHER = 'other',
}

export enum ActivityIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  INTENSE = 'intense',
}

export interface IWeatherConditions {
  /** Temperature in Celsius */
  temperature?: number;
  
  /** Weather description */
  description?: string;
  
  /** Humidity percentage */
  humidity?: number;
  
  /** Wind speed */
  windSpeed?: number;
}

/**
 * Weight record
 */
export interface IWeightRecord {
  /** Record ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Weight in kilograms */
  weight: number;
  
  /** Date recorded */
  date: Date;
  
  /** Body condition score (1-9) */
  bodyConditionScore?: number;
  
  /** Measurement method */
  measurementMethod?: WeightMeasurementMethod;
  
  /** Notes */
  notes?: string;
  
  /** Recorded by (person or device) */
  recordedBy?: string;
}

export enum WeightMeasurementMethod {
  HOME_SCALE = 'home_scale',
  VET_SCALE = 'vet_scale',
  PROFESSIONAL_SCALE = 'professional_scale',
  ESTIMATED = 'estimated',
}

/**
 * Food entry
 */
export interface IFoodEntry {
  /** Entry ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Food name */
  foodName: string;
  
  /** Brand name */
  brand?: string;
  
  /** Quantity in grams */
  quantity: number;
  
  /** Calories */
  calories: number;
  
  /** Protein in grams */
  protein?: number;
  
  /** Fat in grams */
  fat?: number;
  
  /** Carbohydrates in grams */
  carbs?: number;
  
  /** Fiber in grams */
  fiber?: number;
  
  /** Sodium in milligrams */
  sodium?: number;
  
  /** Date and time */
  date: Date;
  
  /** Meal type */
  mealType: MealType;
  
  /** Food type */
  foodType: FoodType;
  
  /** Feeding method */
  feedingMethod?: FeedingMethod;
  
  /** Notes */
  notes?: string;
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  TREAT = 'treat',
}

export enum FoodType {
  DRY_KIBBLE = 'dry_kibble',
  WET_FOOD = 'wet_food',
  RAW_FOOD = 'raw_food',
  HOMEMADE = 'homemade',
  TREAT = 'treat',
  SUPPLEMENT = 'supplement',
  OTHER = 'other',
}

export enum FeedingMethod {
  BOWL = 'bowl',
  PUZZLE_FEEDER = 'puzzle_feeder',
  SLOW_FEEDER = 'slow_feeder',
  HAND_FED = 'hand_fed',
  AUTOMATIC_FEEDER = 'automatic_feeder',
  OTHER = 'other',
}

/**
 * Calorie target
 */
export interface ICalorieTarget {
  /** Target ID */
  id: string;
  
  /** Pet ID */
  petId: string;
  
  /** Daily calorie goal */
  dailyCalorieGoal: number;
  
  /** Target weight */
  targetWeight?: number;
  
  /** Weight goal */
  weightGoal: WeightGoal;
  
  /** Activity level */
  activityLevel: ActivityLevel;
  
  /** Created date */
  createdAt: Date;
  
  /** Updated date */
  updatedAt: Date;
  
  /** Is currently active */
  isActive: boolean;
}

export enum WeightGoal {
  MAINTAIN = 'maintain',
  LOSE = 'lose',
  GAIN = 'gain',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

/**
 * Daily nutrition summary
 */
export interface IDailyNutritionSummary {
  /** Summary date */
  date: Date;
  
  /** Pet ID */
  petId: string;
  
  /** Total calories consumed */
  totalCalories: number;
  
  /** Total protein consumed */
  totalProtein: number;
  
  /** Total fat consumed */
  totalFat: number;
  
  /** Total carbohydrates consumed */
  totalCarbs: number;
  
  /** Calorie goal for the day */
  calorieGoal: number;
  
  /** Remaining calories */
  remainingCalories: number;
  
  /** Food entries for the day */
  foodEntries: IFoodEntry[];
  
  /** Water intake in milliliters */
  waterIntake?: number;
  
  /** Treat count */
  treatCount: number;
}

/**
 * Pet nutrition profile
 */
export interface IPetNutritionProfile {
  /** Pet ID */
  petId: string;
  
  /** Activity level */
  activityLevel: ActivityLevel;
  
  /** Is spayed/neutered */
  spayedNeutered: boolean;
  
  /** Health conditions affecting nutrition */
  healthConditions?: string[];
  
  /** Dietary restrictions */
  dietaryRestrictions?: IDietaryRestriction[];
  
  /** Preferred foods */
  preferredFoods?: string[];
  
  /** Foods to avoid */
  foodsToAvoid?: string[];
  
  /** Feeding schedule */
  feedingSchedule?: IFeedingSchedule[];
  
  /** Last updated */
  lastUpdated: Date;
}

export interface IDietaryRestriction {
  /** Restriction type */
  type: DietaryRestrictionType;
  
  /** Description */
  description: string;
  
  /** Severity */
  severity: HealthSeverity;
  
  /** Notes */
  notes?: string;
}

export enum DietaryRestrictionType {
  ALLERGY = 'allergy',
  INTOLERANCE = 'intolerance',
  MEDICAL = 'medical',
  PREFERENCE = 'preference',
  OTHER = 'other',
}

export interface IFeedingSchedule {
  /** Time of feeding */
  time: string; // Format: "HH:MM"
  
  /** Meal type */
  mealType: MealType;
  
  /** Portion size in grams */
  portionSize: number;
  
  /** Food type */
  foodType: FoodType;
  
  /** Is active */
  isActive: boolean;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

/**
 * Pet search criteria
 */
export interface IPetSearchCriteria {
  /** Search by name */
  name?: string;
  
  /** Search by type */
  type?: PetType;
  
  /** Search by breed */
  breed?: string;
  
  /** Search by age range */
  ageRange?: {
    min: number;
    max: number;
  };
  
  /** Search by weight range */
  weightRange?: {
    min: number;
    max: number;
  };
  
  /** Search by gender */
  gender?: PetGender;
  
  /** Search by owner ID */
  ownerId?: string;
  
  /** Search by health conditions */
  healthConditions?: string[];
  
  /** Search by location */
  location?: string;
}

/**
 * Pet statistics
 */
export interface IPetStatistics {
  /** Pet ID */
  petId: string;
  
  /** Total vet visits */
  totalVetVisits: number;
  
  /** Total activities */
  totalActivities: number;
  
  /** Average daily calories */
  averageDailyCalories: number;
  
  /** Weight trend */
  weightTrend: WeightTrend;
  
  /** Health score (1-10) */
  healthScore: number;
  
  /** Activity score (1-10) */
  activityScore: number;
  
  /** Nutrition score (1-10) */
  nutritionScore: number;
  
  /** Last calculation date */
  lastCalculated: Date;
}

export enum WeightTrend {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  FLUCTUATING = 'fluctuating',
}

/**
 * Pet collection interface for managing multiple pets
 */
export interface IPetCollection {
  /** All pets */
  pets: IPet[];
  
  /** Total count */
  totalCount: number;
  
  /** Filtered count (after search/filter) */
  filteredCount: number;
  
  /** Search criteria applied */
  searchCriteria?: IPetSearchCriteria;
  
  /** Sort order */
  sortOrder?: PetSortOrder;
  
  /** Page information for pagination */
  pagination?: IPagination;
}

export enum PetSortOrder {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  AGE_ASC = 'age_asc',
  AGE_DESC = 'age_desc',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  WEIGHT_ASC = 'weight_asc',
  WEIGHT_DESC = 'weight_desc',
}

export interface IPagination {
  /** Current page */
  currentPage: number;
  
  /** Items per page */
  itemsPerPage: number;
  
  /** Total pages */
  totalPages: number;
  
  /** Has next page */
  hasNext: boolean;
  
  /** Has previous page */
  hasPrevious: boolean;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Standard API response interface
 */
export interface IPetApiResponse<T = unknown> {
  /** Success status */
  success: boolean;
  
  /** Response data */
  data?: T;
  
  /** Error message */
  error?: string;
  
  /** Error code */
  errorCode?: string;
  
  /** Response timestamp */
  timestamp: Date;
  
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Pet creation response
 */
export interface IPetCreationResponse extends IPetApiResponse<IPet> {
  /** Generated pet ID */
  petId: string;
}

/**
 * Pet update response
 */
export interface IPetUpdateResponse extends IPetApiResponse<IPet> {
  /** Updated fields */
  updatedFields: string[];
}

/**
 * Pet deletion response
 */
export interface IPetDeletionResponse extends IPetApiResponse<void> {
  /** Deleted pet ID */
  deletedPetId: string;
}

// ============================================================================
// EXPORT ALL INTERFACES
// ============================================================================

export type {
  IPet as Pet,
  IVetVisit as VetVisit,
  IVaccination as Vaccination,
  IActivity as Activity,
  IWeightRecord as WeightRecord,
  IFoodEntry as FoodEntry,
  ICalorieTarget as CalorieTarget,
  IDailyNutritionSummary as DailyNutritionSummary,
  IPetNutritionProfile as PetNutritionProfile,
  IPetStatistics as PetStatistics,
  IPetCollection as PetCollection,
  IPetSearchCriteria as PetSearchCriteria,
};
