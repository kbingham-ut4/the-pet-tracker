import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
    Pet,
    VetVisit,
    Vaccination,
    Activity,
    WeightRecord,
    FoodEntry,
    CalorieTarget,
    PetNutritionProfile,
    PetType,
    ActivityLevel
} from '../types';
import { config } from '../config';
import { logger } from '../utils';

interface PetState {
    pets: Pet[];
    vetVisits: VetVisit[];
    vaccinations: Vaccination[];
    activities: Activity[];
    weightRecords: WeightRecord[];
    foodEntries: FoodEntry[];
    calorieTargets: CalorieTarget[];
    nutritionProfiles: PetNutritionProfile[];
    loading: boolean;
    error: string | null;
}

type PetAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'ADD_PET'; payload: Pet }
    | { type: 'UPDATE_PET'; payload: Pet }
    | { type: 'DELETE_PET'; payload: string }
    | { type: 'SET_PETS'; payload: Pet[] }
    | { type: 'ADD_VET_VISIT'; payload: VetVisit }
    | { type: 'ADD_VACCINATION'; payload: Vaccination }
    | { type: 'ADD_ACTIVITY'; payload: Activity }
    | { type: 'ADD_WEIGHT_RECORD'; payload: WeightRecord }
    | { type: 'ADD_FOOD_ENTRY'; payload: FoodEntry }
    | { type: 'UPDATE_FOOD_ENTRY'; payload: FoodEntry }
    | { type: 'DELETE_FOOD_ENTRY'; payload: string }
    | { type: 'SET_CALORIE_TARGET'; payload: CalorieTarget }
    | { type: 'SET_NUTRITION_PROFILE'; payload: PetNutritionProfile };

const initialState: PetState = {
    pets: [],
    vetVisits: [],
    vaccinations: [],
    activities: [],
    weightRecords: [],
    foodEntries: [],
    calorieTargets: [],
    nutritionProfiles: [],
    loading: false,
    error: null,
};

function petReducer(state: PetState, action: PetAction): PetState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_PETS':
            return { ...state, pets: action.payload, loading: false };
        case 'ADD_PET':
            return { ...state, pets: [...state.pets, action.payload] };
        case 'UPDATE_PET':
            return {
                ...state,
                pets: state.pets.map(pet =>
                    pet.id === action.payload.id ? action.payload : pet
                ),
            };
        case 'DELETE_PET':
            return {
                ...state,
                pets: state.pets.filter(pet => pet.id !== action.payload),
            };
        case 'ADD_VET_VISIT':
            return { ...state, vetVisits: [...state.vetVisits, action.payload] };
        case 'ADD_VACCINATION':
            return { ...state, vaccinations: [...state.vaccinations, action.payload] };
        case 'ADD_ACTIVITY':
            return { ...state, activities: [...state.activities, action.payload] };
        case 'ADD_WEIGHT_RECORD':
            return { ...state, weightRecords: [...state.weightRecords, action.payload] };
        case 'ADD_FOOD_ENTRY':
            return { ...state, foodEntries: [...state.foodEntries, action.payload] };
        case 'UPDATE_FOOD_ENTRY':
            return {
                ...state,
                foodEntries: state.foodEntries.map(entry =>
                    entry.id === action.payload.id ? action.payload : entry
                ),
            };
        case 'DELETE_FOOD_ENTRY':
            return {
                ...state,
                foodEntries: state.foodEntries.filter(entry => entry.id !== action.payload),
            };
        case 'SET_CALORIE_TARGET':
            return {
                ...state,
                calorieTargets: state.calorieTargets.filter(target => target.petId !== action.payload.petId)
                    .concat(action.payload),
            };
        case 'SET_NUTRITION_PROFILE':
            return {
                ...state,
                nutritionProfiles: state.nutritionProfiles.filter(profile => profile.petId !== action.payload.petId)
                    .concat(action.payload),
            };
        default:
            return state;
    }
}

interface PetContextType extends PetState {
    addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updatePet: (pet: Pet) => void;
    deletePet: (petId: string) => void;
    addVetVisit: (vetVisit: Omit<VetVisit, 'id'>) => void;
    addVaccination: (vaccination: Omit<Vaccination, 'id'>) => void;
    addActivity: (activity: Omit<Activity, 'id'>) => void;
    addWeightRecord: (weightRecord: Omit<WeightRecord, 'id'>) => void;
    addFoodEntry: (foodEntry: Omit<FoodEntry, 'id'>) => void;
    updateFoodEntry: (foodEntry: FoodEntry) => void;
    deleteFoodEntry: (entryId: string) => void;
    setCalorieTarget: (target: CalorieTarget) => void;
    setNutritionProfile: (profile: PetNutritionProfile) => void;
    getPetById: (id: string) => Pet | undefined;
    getWeightRecordsForPet: (petId: string) => WeightRecord[];
    getFoodEntriesForPet: (petId: string) => FoodEntry[];
    getCalorieTargetForPet: (petId: string) => CalorieTarget | undefined;
    getNutritionProfileForPet: (petId: string) => PetNutritionProfile | undefined;
    addSamplePets: () => void; // Development helper
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(petReducer, initialState);

    const addPet = (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => {
        logger.info('Adding new pet:', petData.name);

        const newPet: Pet = {
            ...petData,
            id: Date.now().toString(), // Simple ID generation - replace with UUID in production
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        dispatch({ type: 'ADD_PET', payload: newPet });

        if (config.enableDebugMode) {
            logger.debug('Pet added successfully:', newPet);
        }
    };

    const updatePet = (pet: Pet) => {
        const updatedPet = { ...pet, updatedAt: new Date() };
        dispatch({ type: 'UPDATE_PET', payload: updatedPet });
    };

    const deletePet = (petId: string) => {
        dispatch({ type: 'DELETE_PET', payload: petId });
    };

    const addVetVisit = (vetVisitData: Omit<VetVisit, 'id'>) => {
        const newVetVisit: VetVisit = {
            ...vetVisitData,
            id: Date.now().toString(),
        };
        dispatch({ type: 'ADD_VET_VISIT', payload: newVetVisit });
    };

    const addVaccination = (vaccinationData: Omit<Vaccination, 'id'>) => {
        const newVaccination: Vaccination = {
            ...vaccinationData,
            id: Date.now().toString(),
        };
        dispatch({ type: 'ADD_VACCINATION', payload: newVaccination });
    };

    const addActivity = (activityData: Omit<Activity, 'id'>) => {
        const newActivity: Activity = {
            ...activityData,
            id: Date.now().toString(),
        };
        dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
    };

    const addWeightRecord = (weightRecordData: Omit<WeightRecord, 'id'>) => {
        const newWeightRecord: WeightRecord = {
            ...weightRecordData,
            id: Date.now().toString(),
        };
        dispatch({ type: 'ADD_WEIGHT_RECORD', payload: newWeightRecord });
    };

    const addFoodEntry = (foodEntryData: Omit<FoodEntry, 'id'>) => {
        const newFoodEntry: FoodEntry = {
            ...foodEntryData,
            id: Date.now().toString(),
        };
        dispatch({ type: 'ADD_FOOD_ENTRY', payload: newFoodEntry });
    };

    const updateFoodEntry = (foodEntry: FoodEntry) => {
        dispatch({ type: 'UPDATE_FOOD_ENTRY', payload: foodEntry });
    };

    const deleteFoodEntry = (entryId: string) => {
        dispatch({ type: 'DELETE_FOOD_ENTRY', payload: entryId });
    };

    const setCalorieTarget = (target: CalorieTarget) => {
        dispatch({ type: 'SET_CALORIE_TARGET', payload: target });
    };

    const setNutritionProfile = (profile: PetNutritionProfile) => {
        dispatch({ type: 'SET_NUTRITION_PROFILE', payload: profile });
    };

    const getPetById = (id: string): Pet | undefined => {
        return state.pets.find(pet => pet.id === id);
    };

    const getWeightRecordsForPet = (petId: string): WeightRecord[] => {
        return state.weightRecords.filter(record => record.petId === petId);
    };

    const getFoodEntriesForPet = (petId: string): FoodEntry[] => {
        return state.foodEntries.filter(entry => entry.petId === petId);
    };

    const getCalorieTargetForPet = (petId: string): CalorieTarget | undefined => {
        return state.calorieTargets.find(target => target.petId === petId);
    };

    const getNutritionProfileForPet = (petId: string): PetNutritionProfile | undefined => {
        return state.nutritionProfiles.find(profile => profile.petId === petId);
    };

    // Development helper - add sample pets for testing
    const addSamplePets = () => {
        const samplePets = [
            {
                name: 'Buddy',
                type: PetType.DOG,
                breed: 'Golden Retriever',
                age: 3,
                weight: 28.5,
                gender: 'male' as const,
                color: 'Golden',
            },
            {
                name: 'Luna',
                type: PetType.DOG,
                breed: 'Border Collie',
                age: 2,
                weight: 18.2,
                gender: 'female' as const,
                color: 'Black and White',
            },
            {
                name: 'Whiskers',
                type: PetType.CAT,
                breed: 'Maine Coon',
                age: 5,
                weight: 6.8,
                gender: 'male' as const,
                color: 'Tabby',
            },
        ];

        samplePets.forEach(petData => addPet(petData));

        // Add sample nutrition profiles for dogs
        setTimeout(() => {
            state.pets
                .filter(pet => pet.type === PetType.DOG)
                .forEach(pet => {
                    setNutritionProfile({
                        petId: pet.id,
                        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
                        spayedNeutered: true,
                        lastUpdated: new Date(),
                    });
                });
        }, 100);
    };

    const value: PetContextType = {
        ...state,
        addPet,
        updatePet,
        deletePet,
        addVetVisit,
        addVaccination,
        addActivity,
        addWeightRecord,
        addFoodEntry,
        updateFoodEntry,
        deleteFoodEntry,
        setCalorieTarget,
        setNutritionProfile,
        getPetById,
        getWeightRecordsForPet,
        getFoodEntriesForPet,
        getCalorieTargetForPet,
        getNutritionProfileForPet,
        addSamplePets,
    };

    return (
        <PetContext.Provider value={value}>
            {children}
        </PetContext.Provider>
    );
}

export function usePets() {
    const context = useContext(PetContext);
    if (context === undefined) {
        throw new Error('usePets must be used within a PetProvider');
    }
    return context;
}
