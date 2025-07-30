import { Pet, PetType, ActivityLevel, PetGender } from '../types';

export const mockPet: Pet = {
  id: 'test-pet-id',
  name: 'Buddy',
  type: PetType.DOG,
  breed: 'Golden Retriever',
  weight: 30,
  color: 'Golden',
  gender: PetGender.MALE,
  microchipId: '123456789',
  photoUri: 'file://test-photo.jpg',
  ownerNotes: 'Very friendly and energetic',
  ownerId: 'test-owner-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2021-03-15'), // Will be used to calculate age
};

export const mockCat: Pet = {
  id: 'test-cat-id',
  name: 'Whiskers',
  type: PetType.CAT,
  breed: 'Siamese',
  weight: 8,
  color: 'Cream',
  gender: PetGender.FEMALE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2022-07-22'), // Will be used to calculate age
};

export const createMockPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 'mock-pet-id',
  name: 'Test Pet',
  type: PetType.DOG,
  breed: 'Test Breed',
  weight: 10,
  color: 'Brown',
  gender: PetGender.MALE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2023-01-01'), // Will be used to calculate age
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
