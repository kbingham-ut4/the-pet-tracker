import { useMemo } from 'react';
import { Pet, PetType, ActivityLevel } from '../types';
import { usePets } from '../contexts';
import { CalorieCalculatorFactory } from '../services/CalorieCalculatorFactory';
import { error } from '../utils/logger';

interface PetCalorieData {
  todaysCalories: number;
  targetCalories: number;
}

export const usePetCalories = (pet: Pet): PetCalorieData => {
  const { getFoodEntriesForPet, getCalorieTargetForPet } = usePets();

  // Memoize today's date string to prevent recalculation on every render
  const todayDateString = useMemo(() => new Date().toDateString(), []);

  const todaysCalories = useMemo(() => {
    const todayEntries = getFoodEntriesForPet(pet.id).filter(entry => {
      const entryDate = new Date(entry.date).toDateString();
      return entryDate === todayDateString;
    });

    return todayEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
  }, [pet.id, getFoodEntriesForPet, todayDateString]);

  const targetCalories = useMemo(() => {
    const calorieTarget = getCalorieTargetForPet(pet.id);
    if (calorieTarget) {
      return calorieTarget.dailyCalorieGoal;
    }

    // Fallback calculation using CalorieCalculator
    if (pet.type === PetType.DOG && pet.weight) {
      try {
        const calculator = CalorieCalculatorFactory.createCalculator(pet.type);
        const ageInYears = pet.age?.years || 3; // Extract years from age object or default
        const activityLevel = ActivityLevel.MODERATELY_ACTIVE; // Default activity level
        const isSpayedNeutered = true; // Default assumption

        const maintenanceCalories = calculator.calculateMaintenanceCalories(
          pet.weight,
          ageInYears,
          activityLevel,
          isSpayedNeutered
        );

        return calculator.calculateTargetCalories(maintenanceCalories, 'maintain');
      } catch (err) {
        error('Failed to calculate target calories', {
          error: err instanceof Error ? err.message : String(err),
        });
        return 0;
      }
    }

    return 0;
  }, [pet.id, pet.type, pet.weight, pet.dateOfBirth, pet.age, getCalorieTargetForPet]);

  return { todaysCalories, targetCalories };
};
