import { FoodEntry, WeightRecord, CalorieTarget, DailyNutritionSummary, MealType } from '../types';
import { generateId, formatDate } from '../utils';

export class NutritionService {
    // Common food database with calorie information (per 100g)
    private static readonly COMMON_FOODS = {
        // Dog foods (dry kibble)
        'premium_adult_dry': { calories: 350, protein: 25, fat: 14, carbs: 45 },
        'puppy_dry': { calories: 380, protein: 28, fat: 16, carbs: 42 },
        'senior_dry': { calories: 320, protein: 22, fat: 12, carbs: 48 },
        'weight_management_dry': { calories: 290, protein: 24, fat: 8, carbs: 52 },

        // Wet foods
        'wet_chicken': { calories: 120, protein: 10, fat: 6, carbs: 8 },
        'wet_beef': { calories: 140, protein: 12, fat: 8, carbs: 6 },
        'wet_salmon': { calories: 130, protein: 11, fat: 7, carbs: 7 },

        // Treats
        'training_treats': { calories: 350, protein: 15, fat: 12, carbs: 60 },
        'dental_chews': { calories: 280, protein: 18, fat: 4, carbs: 55 },
        'biscuits': { calories: 400, protein: 10, fat: 15, carbs: 70 },

        // Raw/Fresh foods
        'cooked_chicken_breast': { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
        'cooked_beef': { calories: 250, protein: 26, fat: 15, carbs: 0 },
        'cooked_salmon': { calories: 206, protein: 22, fat: 12, carbs: 0 },
        'white_rice': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
        'sweet_potato': { calories: 86, protein: 1.6, fat: 0.1, carbs: 20 },
        'carrots': { calories: 41, protein: 0.9, fat: 0.2, carbs: 10 },
        'green_beans': { calories: 31, protein: 1.8, fat: 0.1, carbs: 7 },
    };

    static getFoodNutrition(foodKey: string): { calories: number; protein: number; fat: number; carbs: number } | null {
        return this.COMMON_FOODS[foodKey as keyof typeof this.COMMON_FOODS] || null;
    }

    static getAllFoods(): Array<{ key: string; name: string; nutrition: any }> {
        return Object.entries(this.COMMON_FOODS).map(([key, nutrition]) => ({
            key,
            name: this.formatFoodName(key),
            nutrition,
        }));
    }

    static createFoodEntry(
        petId: string,
        foodName: string,
        quantity: number,
        mealType: MealType,
        customCalories?: number,
        customNutrition?: { protein?: number; fat?: number; carbs?: number }
    ): FoodEntry {
        let calories = customCalories || 0;
        let protein = customNutrition?.protein || 0;
        let fat = customNutrition?.fat || 0;
        let carbs = customNutrition?.carbs || 0;

        // Try to get nutrition from common foods database
        if (!customCalories) {
            const foodKey = this.findFoodKey(foodName);
            const nutrition = foodKey ? this.getFoodNutrition(foodKey) : null;

            if (nutrition) {
                // Calculate based on quantity (nutrition data is per 100g)
                const multiplier = quantity / 100;
                calories = Math.round(nutrition.calories * multiplier);
                protein = Math.round(nutrition.protein * multiplier);
                fat = Math.round(nutrition.fat * multiplier);
                carbs = Math.round(nutrition.carbs * multiplier);
            }
        }

        return {
            id: generateId(),
            petId,
            foodName,
            quantity,
            calories,
            protein,
            fat,
            carbs,
            date: new Date(),
            mealType,
        };
    }

    static calculateDailySummary(
        foodEntries: FoodEntry[],
        date: Date,
        calorieGoal: number
    ): DailyNutritionSummary {
        const dateStr = formatDate(date);
        const dayEntries = foodEntries.filter(entry => formatDate(entry.date) === dateStr);

        const totals = dayEntries.reduce(
            (sum, entry) => ({
                calories: sum.calories + entry.calories,
                protein: sum.protein + (entry.protein || 0),
                fat: sum.fat + (entry.fat || 0),
                carbs: sum.carbs + (entry.carbs || 0),
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        return {
            date,
            totalCalories: totals.calories,
            totalProtein: totals.protein,
            totalFat: totals.fat,
            totalCarbs: totals.carbs,
            calorieGoal,
            remainingCalories: calorieGoal - totals.calories,
            foodEntries: dayEntries,
        };
    }

    static createWeightRecord(petId: string, weight: number, notes?: string): WeightRecord {
        return {
            id: generateId(),
            petId,
            weight,
            date: new Date(),
            notes,
        };
    }

    static calculateWeightTrend(weightRecords: WeightRecord[]): {
        trend: 'increasing' | 'decreasing' | 'stable';
        change: number;
        changePercentage: number;
    } | null {
        if (weightRecords.length < 2) return null;

        const sortedRecords = [...weightRecords].sort((a, b) => a.date.getTime() - b.date.getTime());
        const latest = sortedRecords[sortedRecords.length - 1];
        const previous = sortedRecords[sortedRecords.length - 2];

        const change = latest.weight - previous.weight;
        const changePercentage = (change / previous.weight) * 100;

        let trend: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(change) < 0.1) {
            trend = 'stable';
        } else if (change > 0) {
            trend = 'increasing';
        } else {
            trend = 'decreasing';
        }

        return {
            trend,
            change: Math.round(change * 100) / 100,
            changePercentage: Math.round(changePercentage * 100) / 100,
        };
    }

    private static formatFoodName(key: string): string {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private static findFoodKey(foodName: string): string | null {
        const normalizedName = foodName.toLowerCase().replace(/\s+/g, '_');
        return Object.keys(this.COMMON_FOODS).find(key => key === normalizedName) || null;
    }
}
