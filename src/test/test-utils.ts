import { Pet, PetType, ActivityLevel, PetGender } from '../types';

export const mockPet: Pet = {
  id: 'test-pet-id',
  name: 'Buddy',
  type: PetType.DOG,
  breed: 'Golden Retriever',
  age: 3,
  weight: 30,
  color: 'Golden',
  gender: PetGender.MALE,
  microchipId: '123456789',
  photoUri: 'file://test-photo.jpg',
  ownerNotes: 'Very friendly and energetic',
  ownerId: 'test-owner-id',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2021-03-15'), // Makes pet approximately 3 years old
};

export const mockCat: Pet = {
  id: 'test-cat-id',
  name: 'Whiskers',
  type: PetType.CAT,
  breed: 'Siamese',
  age: 2,
  weight: 8,
  color: 'Cream',
  gender: PetGender.FEMALE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2022-07-22'), // Makes cat approximately 2 years old
};

export const createMockPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 'mock-pet-id',
  name: 'Test Pet',
  type: PetType.DOG,
  breed: 'Test Breed',
  age: 1,
  weight: 10,
  color: 'Brown',
  gender: PetGender.MALE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dateOfBirth: new Date('2023-01-01'), // Makes pet approximately 1 year old
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
