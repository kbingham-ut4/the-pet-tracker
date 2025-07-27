import { useMemo } from 'react';
import { Pet, PetType, ActivityLevel } from '../types';
import { usePets } from '../contexts';
import { CalorieCalculatorFactory } from '../services/CalorieCalculatorFactory';
import { error } from '../utils/logging';

interface PetCalorieData {
  todaysCalories: number;
  targetCalories: number;
}

export const usePetCalories = (pet: Pet): PetCalorieData => {
  const { getFoodEntriesForPet, getCalorieTargetForPet } = usePets();

  const todaysCalories = useMemo(() => {
    const todayEntries = getFoodEntriesForPet(pet.id).filter(entry => {
      const entryDate = new Date(entry.date).toDateString();
      const today = new Date().toDateString();
      return entryDate === today;
    });

    return todayEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
  }, [pet.id, getFoodEntriesForPet]);

  const targetCalories = useMemo(() => {
    const calorieTarget = getCalorieTargetForPet(pet.id);
    if (calorieTarget) {
      return calorieTarget.dailyCalorieGoal;
    }

    // Fallback calculation using CalorieCalculator
    if (pet.type === PetType.DOG && pet.weight) {
      try {
        const calculator = CalorieCalculatorFactory.createCalculator(pet.type);
        const age = pet.age || 3; // Default age if not provided
        const activityLevel = ActivityLevel.MODERATELY_ACTIVE; // Default activity level
        const isSpayedNeutered = true; // Default assumption

        const maintenanceCalories = calculator.calculateMaintenanceCalories(
          pet.weight,
          age,
          activityLevel,
          isSpayedNeutered
        );

        return calculator.calculateTargetCalories(maintenanceCalories, 'maintain');
      } catch (err) {
        error('Failed to calculate target calories', err);
        return 0;
      }
    }

    return 0;
  }, [pet, getCalorieTargetForPet]);

  return { todaysCalories, targetCalories };
};
