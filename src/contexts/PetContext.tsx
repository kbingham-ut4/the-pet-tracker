import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
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
  ActivityLevel,
} from '../types';
import {
  OfflinePetStorageService,
  type PetStorageService as _PetStorageService,
} from '../storage/services';
import { info, error, debug } from '../utils/logger';

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
  petLoadingStates: { [petId: string]: boolean }; // Individual pet loading states
  error: string | null;
}

type PetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PET_LOADING'; payload: { petId: string; loading: boolean } }
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
  petLoadingStates: {},
  error: null,
};

function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PET_LOADING':
      return {
        ...state,
        petLoadingStates: {
          ...state.petLoadingStates,
          [action.payload.petId]: action.payload.loading,
        },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PETS':
      return { ...state, pets: action.payload, loading: false };
    case 'ADD_PET':
      return { ...state, pets: [...state.pets, action.payload] };
    case 'UPDATE_PET':
      return {
        ...state,
        pets: state.pets.map(pet => (pet.id === action.payload.id ? action.payload : pet)),
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
        calorieTargets: state.calorieTargets
          .filter(target => target.petId !== action.payload.petId)
          .concat(action.payload),
      };
    case 'SET_NUTRITION_PROFILE':
      return {
        ...state,
        nutritionProfiles: state.nutritionProfiles
          .filter(profile => profile.petId !== action.payload.petId)
          .concat(action.payload),
      };
    default:
      return state;
  }
}

interface PetContextType extends PetState {
  addPet: (_pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePet: (_pet: Pet) => Promise<void>;
  deletePet: (_petId: string) => Promise<void>;
  loadPetsFromStorage: () => Promise<void>;
  refreshPet: (_petId: string) => Promise<void>;
  getPetLoadingState: (_petId: string) => boolean;
  addVetVisit: (_vetVisit: Omit<VetVisit, 'id'>) => void;
  addVaccination: (_vaccination: Omit<Vaccination, 'id'>) => void;
  addActivity: (_activity: Omit<Activity, 'id'>) => void;
  addWeightRecord: (_weightRecord: Omit<WeightRecord, 'id'>) => void;
  addFoodEntry: (_foodEntry: Omit<FoodEntry, 'id'>) => void;
  updateFoodEntry: (_foodEntry: FoodEntry) => void;
  deleteFoodEntry: (_entryId: string) => void;
  setCalorieTarget: (_target: CalorieTarget) => void;
  setNutritionProfile: (_profile: PetNutritionProfile) => void;
  getPetById: (_id: string) => Pet | undefined;
  getWeightRecordsForPet: (_petId: string) => WeightRecord[];
  getFoodEntriesForPet: (_petId: string) => FoodEntry[];
  getCalorieTargetForPet: (_petId: string) => CalorieTarget | undefined;
  getNutritionProfileForPet: (_petId: string) => PetNutritionProfile | undefined;
  addSamplePets: () => void; // Development helper
  clearAllPets: () => Promise<void>; // Development helper
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(petReducer, initialState);
  // Logger is imported directly from utils/logger
  const petStorageService = new OfflinePetStorageService();

  // Load pets from storage on mount
  useEffect(() => {
    loadPetsFromStorage();
  }, []);

  const loadPetsFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const pets = await petStorageService.getAllPets();
      dispatch({ type: 'SET_PETS', payload: pets });

      info('Loaded pets from storage', { count: pets.length });
    } catch (err) {
      error('Failed to load pets from storage', {
        error: err instanceof Error ? err.message : String(err),
      });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load pets' });
    }
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      info('Adding new pet', { petName: petData.name });

      const newPet = await petStorageService.addPet({
        ...petData,
        ownerId: 'current-user', // TODO: Get from auth context
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dispatch({ type: 'ADD_PET', payload: newPet });
      dispatch({ type: 'SET_LOADING', payload: false });

      debug('Pet added successfully:', { petId: newPet.id, petName: newPet.name });
    } catch (err) {
      error('Failed to add pet', {
        error: err instanceof Error ? err.message : String(err),
      });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add pet' });
    }
  };

  const updatePet = async (pet: Pet) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const updatedPet = await petStorageService.updatePet(pet.id, {
        ...pet,
        updatedAt: new Date(),
      });

      dispatch({ type: 'UPDATE_PET', payload: updatedPet });
      dispatch({ type: 'SET_LOADING', payload: false });

      debug('Pet updated successfully:', { petId: updatedPet.id, petName: updatedPet.name });
    } catch (err) {
      error('Failed to update pet', {
        error: err instanceof Error ? err.message : String(err),
      });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update pet' });
    }
  };

  const deletePet = async (petId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await petStorageService.deletePet(petId);
      dispatch({ type: 'DELETE_PET', payload: petId });
      dispatch({ type: 'SET_LOADING', payload: false });

      info('Pet deleted successfully', { petId });
    } catch (err) {
      error('Failed to delete pet', {
        error: err instanceof Error ? err.message : String(err),
      });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete pet' });
    }
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

  const refreshPet = async (petId: string) => {
    try {
      dispatch({ type: 'SET_PET_LOADING', payload: { petId, loading: true } });

      // Refresh the specific pet from storage
      const pet = await petStorageService.getPet(petId);
      if (pet) {
        dispatch({ type: 'UPDATE_PET', payload: pet });
      }

      dispatch({ type: 'SET_PET_LOADING', payload: { petId, loading: false } });

      info('Pet refreshed successfully', { petId });
    } catch (err) {
      error('Failed to refresh pet', {
        petId,
        error: err instanceof Error ? err.message : String(err),
      });
      dispatch({ type: 'SET_PET_LOADING', payload: { petId, loading: false } });
    }
  };

  const getPetLoadingState = (petId: string): boolean => {
    return state.petLoadingStates[petId] || false;
  };

  // Development helper - add sample pets for testing
  const addSamplePets = async () => {
    const samplePets = [
      {
        name: 'Buddy',
        type: PetType.DOG,
        breed: 'Golden Retriever',
        age: 3,
        weight: 28.5,
        gender: 'male' as const,
        color: 'Golden',
        ownerId: 'current-user', // TODO: Get from auth context
      },
      {
        name: 'Luna',
        type: PetType.DOG,
        breed: 'Border Collie',
        age: 2,
        weight: 18.2,
        gender: 'female' as const,
        color: 'Black and White',
        ownerId: 'current-user', // TODO: Get from auth context
      },
      {
        name: 'Whiskers',
        type: PetType.CAT,
        breed: 'Maine Coon',
        age: 5,
        weight: 6.8,
        gender: 'male' as const,
        color: 'Tabby',
        ownerId: 'current-user', // TODO: Get from auth context
      },
    ];

    // Add pets using async method
    for (const petData of samplePets) {
      await addPet(petData);
    }

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

  // Development helper - clear all pets and related data
  const clearAllPets = async () => {
    try {
      info('Clearing all pets and related data');

      // Clear pets from storage first
      for (const pet of state.pets) {
        await petStorageService.deletePet(pet.id);
      }

      // Clear state by setting empty arrays
      dispatch({ type: 'SET_PETS', payload: [] });

      // Note: We're not clearing vet visits, vaccinations, etc. here
      // because they should cascade delete with pets in a real implementation

      info('All pets cleared successfully');
    } catch (err) {
      error('Failed to clear all pets', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };

  const value: PetContextType = {
    ...state,
    addPet,
    updatePet,
    deletePet,
    loadPetsFromStorage,
    refreshPet,
    getPetLoadingState,
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
    clearAllPets,
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
}
