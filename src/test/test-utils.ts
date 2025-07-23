import { Pet, PetType, ActivityLevel } from '../types';

export const mockPet: Pet = {
  id: 'test-pet-id',
  name: 'Buddy',
  type: PetType.DOG,
  breed: 'Golden Retriever',
  age: 3,
  weight: 30,
  color: 'Golden',
  gender: 'male',
  microchipId: '123456789',
  photoUri: 'file://test-photo.jpg',
  ownerNotes: 'Very friendly and energetic',
  ownerId: 'test-owner-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCat: Pet = {
  id: 'test-cat-id',
  name: 'Whiskers',
  type: PetType.CAT,
  breed: 'Siamese',
  age: 2,
  weight: 8,
  color: 'Cream',
  gender: 'female',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const createMockPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 'mock-pet-id',
  name: 'Test Pet',
  type: PetType.DOG,
  breed: 'Test Breed',
  age: 1,
  weight: 10,
  color: 'Brown',
  gender: 'male',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockActivityLevels = {
  sedentary: ActivityLevel.SEDENTARY,
  lightly_active: ActivityLevel.LIGHTLY_ACTIVE,
  moderately_active: ActivityLevel.MODERATELY_ACTIVE,
  very_active: ActivityLevel.VERY_ACTIVE,
  extremely_active: ActivityLevel.EXTREMELY_ACTIVE,
};

// Mock async storage data
export const mockAsyncStorageData = {
  'pet-tracker:pets': JSON.stringify([mockPet, mockCat]),
  'pet-tracker:user-settings': JSON.stringify({
    theme: 'light',
    notifications: true,
  }),
};

// Test helpers
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(setImmediate);
