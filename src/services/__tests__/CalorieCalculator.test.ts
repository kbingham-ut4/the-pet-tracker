import { describe, it, expect, beforeEach } from 'vitest';
import { DogCalorieCalculator } from '../CalorieCalculator';
import { ActivityLevel } from '../../types';

describe('CalorieCalculator', () => {
  describe('DogCalorieCalculator', () => {
    let calculator: DogCalorieCalculator;

    beforeEach(() => {
      calculator = new DogCalorieCalculator();
    });

    describe('calculateMaintenanceCalories', () => {
      it('should calculate maintenance calories for adult dog', () => {
        const calories = calculator.calculateMaintenanceCalories(
          25, // 25kg weight
          5, // 5 years old
          ActivityLevel.MODERATELY_ACTIVE,
          true // spayed/neutered
        );

        expect(calories).toBeGreaterThan(0);
        expect(calories).toBeCloseTo(1127, 0); // Allow ±1 variance
      });

      it('should calculate higher calories for puppies', () => {
        const adultCalories = calculator.calculateMaintenanceCalories(
          10,
          3,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );
        const puppyCalories = calculator.calculateMaintenanceCalories(
          10,
          0.5,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );

        expect(puppyCalories).toBeGreaterThan(adultCalories);
      });

      it('should calculate slightly fewer calories for senior dogs', () => {
        const adultCalories = calculator.calculateMaintenanceCalories(
          20,
          3,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );
        const seniorCalories = calculator.calculateMaintenanceCalories(
          20,
          10,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );

        expect(seniorCalories).toBeLessThan(adultCalories);
      });

      it('should adjust for different activity levels', () => {
        const baseWeight = 15;
        const baseAge = 3;
        const isSpayedNeutered = true;

        const sedentaryCalories = calculator.calculateMaintenanceCalories(
          baseWeight,
          baseAge,
          ActivityLevel.SEDENTARY,
          isSpayedNeutered
        );
        const activeCalories = calculator.calculateMaintenanceCalories(
          baseWeight,
          baseAge,
          ActivityLevel.VERY_ACTIVE,
          isSpayedNeutered
        );

        expect(activeCalories).toBeGreaterThan(sedentaryCalories);
      });

      it('should handle very small dogs', () => {
        const calories = calculator.calculateMaintenanceCalories(
          2,
          2,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );

        expect(calories).toBeGreaterThan(0);
        expect(calories).toBeLessThan(500);
      });

      it('should handle very large dogs', () => {
        const calories = calculator.calculateMaintenanceCalories(
          60,
          4,
          ActivityLevel.MODERATELY_ACTIVE,
          true
        );

        expect(calories).toBeGreaterThan(1500);
      });
    });

    describe('calculateTargetCalories', () => {
      it('should maintain calories for weight maintenance', () => {
        const maintenanceCalories = 1000;
        const targetCalories = calculator.calculateTargetCalories(maintenanceCalories, 'maintain');

        expect(targetCalories).toBe(maintenanceCalories);
      });

      it('should reduce calories for weight loss', () => {
        const maintenanceCalories = 1000;
        const targetCalories = calculator.calculateTargetCalories(maintenanceCalories, 'lose');

        expect(targetCalories).toBeLessThan(maintenanceCalories);
        expect(targetCalories).toBe(800); // 20% reduction
      });

      it('should increase calories for weight gain', () => {
        const maintenanceCalories = 1000;
        const targetCalories = calculator.calculateTargetCalories(maintenanceCalories, 'gain');

        expect(targetCalories).toBeGreaterThan(maintenanceCalories);
        expect(targetCalories).toBe(1200); // 20% increase from 1000
      });
    });

    describe('getRecommendedWeightRange', () => {
      it('should return weight range for known breeds', () => {
        const goldenRetrieverRange = calculator.getRecommendedWeightRange('Golden Retriever');

        expect(goldenRetrieverRange).toBeTruthy();
        expect(goldenRetrieverRange?.min).toBeGreaterThan(0);
        expect(goldenRetrieverRange?.max).toBeGreaterThan(goldenRetrieverRange!.min);
      });

      it('should return null for unknown breeds', () => {
        const unknownBreedRange = calculator.getRecommendedWeightRange('Unknown Fantasy Breed');

        expect(unknownBreedRange).toBeNull();
      });

      it('should be case insensitive', () => {
        const range1 = calculator.getRecommendedWeightRange('labrador retriever');
        const range2 = calculator.getRecommendedWeightRange('Labrador Retriever');

        expect(range1).toEqual(range2);
      });
    });
  });
});
