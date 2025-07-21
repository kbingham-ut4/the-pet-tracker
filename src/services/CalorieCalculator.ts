import { PetType, ActivityLevel } from '../types';

// Base abstract class for calorie calculations
export abstract class CalorieCalculator {
    protected petType: PetType;

    constructor(petType: PetType) {
        this.petType = petType;
    }

    abstract calculateMaintenanceCalories(
        weight: number,
        age: number,
        activityLevel: ActivityLevel,
        isSpayedNeutered: boolean
    ): number;

    abstract calculateTargetCalories(
        maintenanceCalories: number,
        weightGoal: 'maintain' | 'lose' | 'gain'
    ): number;

    abstract getRecommendedWeightRange(breed?: string): { min: number; max: number } | null;
}

// Dog-specific calorie calculator
export class DogCalorieCalculator extends CalorieCalculator {
    constructor() {
        super(PetType.DOG);
    }

    calculateMaintenanceCalories(
        weight: number,
        age: number,
        activityLevel: ActivityLevel,
        isSpayedNeutered: boolean
    ): number {
        // Base calculation using Resting Energy Requirement (RER)
        // RER = 70 * (body weight in kg)^0.75
        const rer = 70 * Math.pow(weight, 0.75);

        // Apply activity multipliers
        let activityMultiplier = this.getActivityMultiplier(activityLevel);

        // Adjust for age
        if (age < 1) {
            activityMultiplier *= 2.0; // Puppies need more calories
        } else if (age > 7) {
            activityMultiplier *= 0.9; // Senior dogs need slightly fewer calories
        }

        // Adjust for spay/neuter status
        if (isSpayedNeutered) {
            activityMultiplier *= 0.9; // Spayed/neutered dogs need fewer calories
        }

        return Math.round(rer * activityMultiplier);
    }

    calculateTargetCalories(
        maintenanceCalories: number,
        weightGoal: 'maintain' | 'lose' | 'gain'
    ): number {
        switch (weightGoal) {
            case 'lose':
                return Math.round(maintenanceCalories * 0.8); // 20% reduction for weight loss
            case 'gain':
                return Math.round(maintenanceCalories * 1.2); // 20% increase for weight gain
            case 'maintain':
            default:
                return maintenanceCalories;
        }
    }

    getRecommendedWeightRange(breed?: string): { min: number; max: number } | null {
        // Simplified breed-based weight ranges (in kg)
        const breedWeights: { [key: string]: { min: number; max: number } } = {
            'chihuahua': { min: 1.5, max: 3 },
            'yorkshire terrier': { min: 2, max: 3.2 },
            'pomeranian': { min: 1.9, max: 3.5 },
            'beagle': { min: 9, max: 11 },
            'cocker spaniel': { min: 12, max: 15 },
            'border collie': { min: 14, max: 20 },
            'golden retriever': { min: 25, max: 34 },
            'labrador retriever': { min: 25, max: 36 },
            'german shepherd': { min: 22, max: 40 },
            'rottweiler': { min: 35, max: 60 },
            'great dane': { min: 45, max: 90 },
        };

        if (!breed) return null;

        const normalizedBreed = breed.toLowerCase().trim();
        return breedWeights[normalizedBreed] || null;
    }

    private getActivityMultiplier(activityLevel: ActivityLevel): number {
        switch (activityLevel) {
            case ActivityLevel.SEDENTARY:
                return 1.2;
            case ActivityLevel.LIGHTLY_ACTIVE:
                return 1.4;
            case ActivityLevel.MODERATELY_ACTIVE:
                return 1.6;
            case ActivityLevel.VERY_ACTIVE:
                return 1.8;
            case ActivityLevel.EXTREMELY_ACTIVE:
                return 2.0;
            default:
                return 1.4;
        }
    }

    // Calculate calories for weight loss with specific timeline
    calculateWeightLossCalories(
        currentWeight: number,
        targetWeight: number,
        age: number,
        activityLevel: ActivityLevel,
        isSpayedNeutered: boolean,
        weeksToGoal: number = 16
    ): { dailyCalories: number; weeklyWeightLoss: number; safeWeightLoss: boolean } {
        const maintenanceCalories = this.calculateMaintenanceCalories(
            currentWeight,
            age,
            activityLevel,
            isSpayedNeutered
        );

        const weightToLose = currentWeight - targetWeight;
        const weeklyWeightLoss = weightToLose / weeksToGoal;

        // Safe weight loss is typically 1-2% of body weight per week
        const maxSafeWeeklyLoss = currentWeight * 0.02;
        const safeWeightLoss = weeklyWeightLoss <= maxSafeWeeklyLoss;

        // 1 kg of fat ≈ 7700 calories
        const weeklyCalorieDeficit = weeklyWeightLoss * 7700;
        const dailyCalorieDeficit = weeklyCalorieDeficit / 7;
        const dailyCalories = Math.round(maintenanceCalories - dailyCalorieDeficit);

        // Ensure we don't go below 60% of maintenance calories
        const minimumCalories = Math.round(maintenanceCalories * 0.6);

        return {
            dailyCalories: Math.max(dailyCalories, minimumCalories),
            weeklyWeightLoss,
            safeWeightLoss,
        };
    }
}
