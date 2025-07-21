import { describe, it, expect } from 'vitest';
import { CalorieCalculatorFactory } from '../CalorieCalculatorFactory';
import { DogCalorieCalculator } from '../CalorieCalculator';
import { PetType } from '../../types';

describe('CalorieCalculatorFactory', () => {
    describe('createCalculator', () => {
        it('should create DogCalorieCalculator for dog pets', () => {
            const calculator = CalorieCalculatorFactory.createCalculator(PetType.DOG);

            expect(calculator).toBeInstanceOf(DogCalorieCalculator);
            expect(calculator.calculateMaintenanceCalories).toBeDefined();
            expect(calculator.calculateTargetCalories).toBeDefined();
            expect(calculator.getRecommendedWeightRange).toBeDefined();
        });

        it('should throw error for unsupported pet types', () => {
            expect(() => {
                CalorieCalculatorFactory.createCalculator(PetType.CAT);
            }).toThrow('Cat calorie calculator not yet implemented');
        });

        it('should throw error for bird pet type', () => {
            expect(() => {
                CalorieCalculatorFactory.createCalculator(PetType.BIRD);
            }).toThrow('Calorie calculator not available for pet type: bird');
        });
    });

    describe('isSupported', () => {
        it('should return true for dogs', () => {
            expect(CalorieCalculatorFactory.isSupported(PetType.DOG)).toBe(true);
        });

        it('should return false for cats', () => {
            expect(CalorieCalculatorFactory.isSupported(PetType.CAT)).toBe(false);
        });

        it('should return false for birds', () => {
            expect(CalorieCalculatorFactory.isSupported(PetType.BIRD)).toBe(false);
        });

        it('should return false for other pet types', () => {
            expect(CalorieCalculatorFactory.isSupported(PetType.OTHER)).toBe(false);
        });
    });
});
