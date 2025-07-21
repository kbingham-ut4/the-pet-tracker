import { describe, it, expect, beforeEach } from 'vitest';
import { NutritionService } from '../NutritionService';
import { createMockPet } from '../../test/test-utils';
import { PetType, MealType } from '../../types';

describe('NutritionService', () => {
    const mockPet = createMockPet({
        id: 'test-pet',
        name: 'Buddy',
        type: PetType.DOG,
        weight: 25,
        age: 3,
        breed: 'Golden Retriever'
    });

    const sampleFoodEntries = [
        {
            id: 'entry-1',
            petId: mockPet.id,
            foodName: 'Premium Adult Dry',
            quantity: 100,
            calories: 350,
            protein: 25,
            fat: 14,
            carbs: 45,
            date: new Date('2024-01-01T08:00:00Z'),
            mealType: MealType.BREAKFAST
        },
        {
            id: 'entry-2',
            petId: mockPet.id,
            foodName: 'Training Treats',
            quantity: 50,
            calories: 175,
            protein: 7,
            fat: 6,
            carbs: 30,
            date: new Date('2024-01-01T12:00:00Z'),
            mealType: MealType.SNACK
        }
    ];

    describe('createFoodEntry', () => {
        it('should create a food entry with calculated calories from database', () => {
            const entry = NutritionService.createFoodEntry(
                mockPet.id,
                'premium_adult_dry',
                100,
                MealType.DINNER
            );

            expect(entry.petId).toBe(mockPet.id);
            expect(entry.foodName).toBe('premium_adult_dry');
            expect(entry.quantity).toBe(100);
            expect(entry.mealType).toBe(MealType.DINNER);
            expect(entry.calories).toBe(350); // 350 calories per 100g
            expect(entry.protein).toBe(25);
            expect(entry.fat).toBe(14);
            expect(entry.carbs).toBe(45);
            expect(entry.id).toBeDefined();
            expect(entry.date).toBeInstanceOf(Date);
        });

        it('should use custom calories when provided', () => {
            const customCalories = 500;
            const entry = NutritionService.createFoodEntry(
                mockPet.id,
                'custom_food',
                100,
                MealType.BREAKFAST,
                customCalories
            );

            expect(entry.calories).toBe(customCalories);
            expect(entry.protein).toBe(0); // Default when not in database
        });

        it('should apply custom nutrition values', () => {
            const customNutrition = { protein: 30, fat: 15, carbs: 10 };
            const entry = NutritionService.createFoodEntry(
                mockPet.id,
                'custom_food',
                100,
                MealType.LUNCH,
                400,
                customNutrition
            );

            expect(entry.protein).toBe(30);
            expect(entry.fat).toBe(15);
            expect(entry.carbs).toBe(10);
        });

        it('should generate unique IDs for different entries', () => {
            const entry1 = NutritionService.createFoodEntry(
                mockPet.id,
                'premium_adult_dry',
                100,
                MealType.BREAKFAST
            );

            const entry2 = NutritionService.createFoodEntry(
                mockPet.id,
                'premium_adult_dry',
                100,
                MealType.BREAKFAST
            );

            expect(entry1.id).not.toBe(entry2.id);
        });

        it('should handle unknown food with zero nutrition values', () => {
            const entry = NutritionService.createFoodEntry(
                mockPet.id,
                'unknown_food',
                100,
                MealType.DINNER
            );

            expect(entry.calories).toBe(0);
            expect(entry.protein).toBe(0);
            expect(entry.fat).toBe(0);
            expect(entry.carbs).toBe(0);
        });
    });

    describe('calculateDailySummary', () => {
        it('should calculate correct daily totals', () => {
            const calorieGoal = 1200;
            const date = new Date('2024-01-01');

            const summary = NutritionService.calculateDailySummary(
                sampleFoodEntries,
                date,
                calorieGoal
            );

            expect(summary.totalCalories).toBe(525); // 350 + 175
            expect(summary.totalProtein).toBe(32); // 25 + 7
            expect(summary.totalFat).toBe(20); // 14 + 6
            expect(summary.totalCarbs).toBe(75); // 45 + 30
            expect(summary.calorieGoal).toBe(calorieGoal);
            expect(summary.remainingCalories).toBe(675); // 1200 - 525
            expect(summary.foodEntries).toHaveLength(2);
        });

        it('should handle empty food entries', () => {
            const calorieGoal = 1000;
            const date = new Date('2024-01-01');

            const summary = NutritionService.calculateDailySummary(
                [],
                date,
                calorieGoal
            );

            expect(summary.totalCalories).toBe(0);
            expect(summary.totalProtein).toBe(0);
            expect(summary.totalFat).toBe(0);
            expect(summary.totalCarbs).toBe(0);
            expect(summary.calorieGoal).toBe(calorieGoal);
            expect(summary.remainingCalories).toBe(1000);
            expect(summary.foodEntries).toHaveLength(0);
        });

        it('should filter entries by date correctly', () => {
            const entriesWithDifferentDates = [
                ...sampleFoodEntries,
                {
                    id: 'entry-3',
                    petId: mockPet.id,
                    foodName: 'Other Day Food',
                    quantity: 50,
                    calories: 100,
                    protein: 5,
                    fat: 2,
                    carbs: 10,
                    date: new Date('2024-01-02'), // Different date
                    mealType: MealType.DINNER
                }
            ];

            const summary = NutritionService.calculateDailySummary(
                entriesWithDifferentDates,
                new Date('2024-01-01'),
                1000
            );

            expect(summary.totalCalories).toBe(525); // Should not include entry-3
            expect(summary.foodEntries).toHaveLength(2);
        });
    });

    describe('createWeightRecord', () => {
        it('should create a weight record with current date', () => {
            const weight = 25.5;
            const notes = 'After morning walk';

            const record = NutritionService.createWeightRecord(mockPet.id, weight, notes);

            expect(record.petId).toBe(mockPet.id);
            expect(record.weight).toBe(weight);
            expect(record.notes).toBe(notes);
            expect(record.id).toBeDefined();
            expect(record.date).toBeInstanceOf(Date);
        });

        it('should create a weight record without notes', () => {
            const weight = 24.8;

            const record = NutritionService.createWeightRecord(mockPet.id, weight);

            expect(record.weight).toBe(weight);
            expect(record.notes).toBeUndefined();
        });
    });

    describe('calculateWeightTrend', () => {
        const weightRecords = [
            { id: '1', petId: mockPet.id, weight: 24, date: new Date('2024-01-01'), notes: '' },
            { id: '2', petId: mockPet.id, weight: 24.5, date: new Date('2024-01-08'), notes: '' },
            { id: '3', petId: mockPet.id, weight: 25, date: new Date('2024-01-15'), notes: '' },
            { id: '4', petId: mockPet.id, weight: 25.3, date: new Date('2024-01-22'), notes: '' },
        ];

        it('should calculate increasing weight trend', () => {
            const trend = NutritionService.calculateWeightTrend(weightRecords);

            expect(trend).not.toBeNull();
            expect(trend!.trend).toBe('increasing');
            expect(trend!.change).toBe(0.3); // 25.3 - 25.0
            expect(trend!.changePercentage).toBeCloseTo(1.2, 1); // (0.3/25) * 100
        });

        it('should calculate decreasing weight trend', () => {
            const decreasingRecords = [
                { id: '1', petId: mockPet.id, weight: 25, date: new Date('2024-01-01'), notes: '' },
                { id: '2', petId: mockPet.id, weight: 24.5, date: new Date('2024-01-08'), notes: '' },
            ];

            const trend = NutritionService.calculateWeightTrend(decreasingRecords);

            expect(trend).not.toBeNull();
            expect(trend!.trend).toBe('decreasing');
            expect(trend!.change).toBe(-0.5);
            expect(trend!.changePercentage).toBe(-2);
        });

        it('should detect stable weight trend', () => {
            const stableRecords = [
                { id: '1', petId: mockPet.id, weight: 25.0, date: new Date('2024-01-01'), notes: '' },
                { id: '2', petId: mockPet.id, weight: 25.05, date: new Date('2024-01-08'), notes: '' },
            ];

            const trend = NutritionService.calculateWeightTrend(stableRecords);

            expect(trend).not.toBeNull();
            expect(trend!.trend).toBe('stable');
            expect(trend!.change).toBe(0.05);
        });

        it('should return null for insufficient data', () => {
            const singleRecord = [weightRecords[0]];
            const trend = NutritionService.calculateWeightTrend(singleRecord);

            expect(trend).toBeNull();
        });

        it('should return null for empty weight records', () => {
            const trend = NutritionService.calculateWeightTrend([]);

            expect(trend).toBeNull();
        });

        it('should sort records by date before calculation', () => {
            // Pass records in random order
            const unorderedRecords = [weightRecords[3], weightRecords[1], weightRecords[0], weightRecords[2]];
            const trend = NutritionService.calculateWeightTrend(unorderedRecords);

            expect(trend).not.toBeNull();
            expect(trend!.change).toBe(0.3); // Should still compare latest (25.3) with second latest (25.0)
        });
    });

    describe('getAllFoods', () => {
        it('should return list of available foods with nutrition info', () => {
            const foods = NutritionService.getAllFoods();

            expect(Array.isArray(foods)).toBe(true);
            expect(foods.length).toBeGreaterThan(0);

            foods.forEach(food => {
                expect(food).toHaveProperty('key');
                expect(food).toHaveProperty('name');
                expect(food).toHaveProperty('nutrition');
                expect(typeof food.key).toBe('string');
                expect(typeof food.name).toBe('string');
                expect(food.nutrition).toHaveProperty('calories');
                expect(food.nutrition).toHaveProperty('protein');
                expect(food.nutrition).toHaveProperty('fat');
                expect(food.nutrition).toHaveProperty('carbs');
            });
        });

        it('should include common dog foods', () => {
            const foods = NutritionService.getAllFoods();
            const foodKeys = foods.map(f => f.key);

            expect(foodKeys).toContain('premium_adult_dry');
            expect(foodKeys).toContain('cooked_chicken_breast');
            expect(foodKeys).toContain('training_treats');
        });

        it('should format food names properly', () => {
            const foods = NutritionService.getAllFoods();
            const premiumFood = foods.find(f => f.key === 'premium_adult_dry');

            expect(premiumFood?.name).toBe('Premium Adult Dry');
        });
    });

    describe('getFoodNutrition', () => {
        it('should return nutrition for valid food key', () => {
            const nutrition = NutritionService.getFoodNutrition('premium_adult_dry');

            expect(nutrition).not.toBeNull();
            expect(nutrition!.calories).toBe(350);
            expect(nutrition!.protein).toBe(25);
            expect(nutrition!.fat).toBe(14);
            expect(nutrition!.carbs).toBe(45);
        });

        it('should return null for invalid food key', () => {
            const nutrition = NutritionService.getFoodNutrition('nonexistent_food');

            expect(nutrition).toBeNull();
        });
    });
});
