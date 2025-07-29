import { useEffect, useState } from 'react';
import { usePets } from '../contexts/PetContext';
import { CalorieCalculatorFactory } from '../services/CalorieCalculatorFactory';
import { DogCalorieCalculator } from '../services/CalorieCalculator';
import { NutritionService } from '../services/NutritionService';
import { DailyNutritionSummary, WeightGoal, ActivityLevel, MealType, PetType } from '../types';
import { generateId } from '../utils';

export function useNutrition(petId: string) {
  const {
    getPetById,
    getWeightRecordsForPet,
    getFoodEntriesForPet,
    getCalorieTargetForPet,
    getNutritionProfileForPet,
    addWeightRecord,
    addFoodEntry,
    setCalorieTarget,
    setNutritionProfile,
  } = usePets();

  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [recommendedCalories, setRecommendedCalories] = useState<number | null>(null);

  const pet = getPetById(petId);
  const weightRecords = getWeightRecordsForPet(petId);
  const foodEntries = getFoodEntriesForPet(petId);
  const calorieTarget = getCalorieTargetForPet(petId);
  const nutritionProfile = getNutritionProfileForPet(petId);

  // Calculate daily summary for today
  useEffect(() => {
    if (foodEntries.length > 0 && calorieTarget) {
      const today = new Date();
      const summary = NutritionService.calculateDailySummary(
        foodEntries,
        today,
        calorieTarget.dailyCalorieGoal
      );
      setDailySummary(summary);
    }
  }, [foodEntries, calorieTarget]);

  // Calculate recommended calories when pet data changes
  useEffect(() => {
    if (pet && pet.type && pet.age && pet.weight && nutritionProfile) {
      try {
        const calculator = CalorieCalculatorFactory.createCalculator(pet.type);
        const maintenanceCalories = calculator.calculateMaintenanceCalories(
          pet.weight,
          pet.age,
          nutritionProfile.activityLevel,
          nutritionProfile.spayedNeutered
        );
        const targetCalories = calculator.calculateTargetCalories(
          maintenanceCalories,
          calorieTarget?.weightGoal || WeightGoal.MAINTAIN
        );
        setRecommendedCalories(targetCalories);
      } catch (error) {
        console.warn('Calorie calculation not available for this pet type:', error);
        setRecommendedCalories(null);
      }
    }
  }, [pet, nutritionProfile, calorieTarget]);

  const logWeight = (weight: number, notes?: string) => {
    addWeightRecord({ petId, weight, date: new Date(), notes });
  };

  const logFood = (
    foodName: string,
    quantity: number,
    mealType: MealType,
    customCalories?: number,
    customNutrition?: { protein?: number; fat?: number; carbs?: number }
  ) => {
    const foodEntry = NutritionService.createFoodEntry(
      petId,
      foodName,
      quantity,
      mealType,
      customCalories,
      customNutrition
    );
    addFoodEntry(foodEntry);
  };

  const updateCalorieGoal = (
    dailyCalorieGoal: number,
    weightGoal: WeightGoal,
    targetWeight?: number
  ) => {
    setCalorieTarget({
      id: calorieTarget?.id || generateId(),
      petId,
      dailyCalorieGoal,
      targetWeight,
      weightGoal,
      createdAt: calorieTarget?.createdAt || new Date(),
      updatedAt: new Date(),
    });
  };

  const updateNutritionProfile = (
    activityLevel: ActivityLevel,
    spayedNeutered: boolean,
    healthConditions?: string[]
  ) => {
    setNutritionProfile({
      petId,
      activityLevel,
      spayedNeutered,
      healthConditions,
      lastUpdated: new Date(),
    });
  };

  const getWeightTrend = () => {
    return NutritionService.calculateWeightTrend(weightRecords);
  };

  const calculateWeightLossPlan = (targetWeight: number, weeks: number = 16) => {
    if (!pet || !pet.age || !pet.weight || !nutritionProfile) {
      return null;
    }

    try {
      const calculator = CalorieCalculatorFactory.createCalculator(pet.type);
      if (calculator instanceof DogCalorieCalculator) {
        return calculator.calculateWeightLossCalories(
          pet.weight,
          targetWeight,
          pet.age,
          nutritionProfile.activityLevel,
          nutritionProfile.spayedNeutered,
          weeks
        );
      }
      return null;
    } catch (error) {
      console.warn('Weight loss calculation not available for this pet type:', error);
      return null;
    }
  };

  return {
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
    isCalorieTrackingSupported: CalorieCalculatorFactory.isSupported(pet?.type || PetType.OTHER),
    commonFoods: NutritionService.getAllFoods(),
  };
}
