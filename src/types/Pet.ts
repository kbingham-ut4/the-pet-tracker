export interface Pet {
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

export interface VetVisit {
    id: string;
    petId: string;
    visitDate: Date;
    veterinarian: string;
    clinic: string;
    reason: string;
    diagnosis?: string;
    treatment?: string;
    medications?: Medication[];
    nextVisitDate?: Date;
    cost?: number;
    notes?: string;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    instructions?: string;
}

export interface Vaccination {
    id: string;
    petId: string;
    vaccineName: string;
    dateAdministered: Date;
    nextDueDate?: Date;
    veterinarian: string;
    batchNumber?: string;
    notes?: string;
}

export interface Activity {
    id: string;
    petId: string;
    type: ActivityType;
    date: Date;
    duration?: number; // in minutes
    distance?: number; // in kilometers
    location?: string;
    notes?: string;
}

export enum ActivityType {
    WALK = 'walk',
    RUN = 'run',
    PLAY = 'play',
    TRAINING = 'training',
    GROOMING = 'grooming',
    FEEDING = 'feeding',
    OTHER = 'other',
}

// Weight and Nutrition Tracking
export interface WeightRecord {
    id: string;
    petId: string;
    weight: number; // in kilograms
    date: Date;
    notes?: string;
}

export interface FoodEntry {
    id: string;
    petId: string;
    foodName: string;
    brand?: string;
    quantity: number; // in grams
    calories: number;
    protein?: number; // in grams
    fat?: number; // in grams
    carbs?: number; // in grams
    date: Date;
    mealType: MealType;
    notes?: string;
}

export enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
    SNACK = 'snack',
    TREAT = 'treat',
}

export interface CalorieTarget {
    id: string;
    petId: string;
    dailyCalorieGoal: number;
    targetWeight?: number;
    weightGoal: WeightGoal;
    createdAt: Date;
    updatedAt: Date;
}

export enum WeightGoal {
    MAINTAIN = 'maintain',
    LOSE = 'lose',
    GAIN = 'gain',
}

export interface DailyNutritionSummary {
    date: Date;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    calorieGoal: number;
    remainingCalories: number;
    foodEntries: FoodEntry[];
}

// Enhanced Pet interface for nutrition tracking
export interface PetNutritionProfile {
    petId: string;
    activityLevel: ActivityLevel;
    spayedNeutered: boolean;
    healthConditions?: string[];
    lastUpdated: Date;
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY_ACTIVE = 'lightly_active',
    MODERATELY_ACTIVE = 'moderately_active',
    VERY_ACTIVE = 'very_active',
    EXTREMELY_ACTIVE = 'extremely_active',
}
