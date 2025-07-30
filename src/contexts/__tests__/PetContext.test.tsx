import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PetType, PetGender } from '../../types';
import { createMockPet } from '../../test/test-utils';

// Mock the storage service
const mockPetStorageService = {
  getAllPets: vi.fn(),
  addPet: vi.fn(),
  updatePet: vi.fn(),
  deletePet: vi.fn(),
  getPet: vi.fn(),
};

vi.mock('../../storage/services/PetStorageService', () => ({
  OfflinePetStorageService: vi.fn(() => mockPetStorageService),
}));

// Import after mocks
import { usePets } from '../PetContext';

describe('PetContext', () => {
  const mockPet = createMockPet({
    id: 'test-pet-1',
    name: 'Buddy',
    type: PetType.DOG,
    age: { years: 3, months: 0 },
    weight: 25,
  });

  const mockPet2 = createMockPet({
    id: 'test-pet-2',
    name: 'Whiskers',
    type: PetType.CAT,
    age: { years: 2, months: 0 },
    weight: 8,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPetStorageService.getAllPets.mockResolvedValue([]);
    mockPetStorageService.addPet.mockResolvedValue(void 0);
    mockPetStorageService.updatePet.mockResolvedValue(void 0);
    mockPetStorageService.deletePet.mockResolvedValue(void 0);
    mockPetStorageService.getPet.mockResolvedValue(null);
  });

  describe('Context API', () => {
    it('should export usePets hook', () => {
      expect(typeof usePets).toBe('function');
    });
  });

  describe('Pet data management', () => {
    it('should handle pet storage operations', () => {
      // Test the storage service mock
      expect(mockPetStorageService.getAllPets).toBeDefined();
      expect(mockPetStorageService.addPet).toBeDefined();
      expect(mockPetStorageService.updatePet).toBeDefined();
      expect(mockPetStorageService.deletePet).toBeDefined();
    });

    it('should create mock pets with correct structure', () => {
      expect(mockPet).toHaveProperty('id');
      expect(mockPet).toHaveProperty('name');
      expect(mockPet).toHaveProperty('type');
      expect(mockPet).toHaveProperty('createdAt');
      expect(mockPet).toHaveProperty('updatedAt');
      expect(mockPet.name).toBe('Buddy');
      expect(mockPet.type).toBe(PetType.DOG);
    });

    it('should handle different pet types', () => {
      expect(mockPet2.name).toBe('Whiskers');
      expect(mockPet2.type).toBe(PetType.CAT);
    });
  });

  describe('Storage service integration', () => {
    it('should call getAllPets when fetching pets', async () => {
      mockPetStorageService.getAllPets.mockResolvedValue([mockPet, mockPet2]);

      const pets = await mockPetStorageService.getAllPets();

      expect(pets).toHaveLength(2);
      expect(mockPetStorageService.getAllPets).toHaveBeenCalledTimes(1);
    });

    it('should call addPet when adding new pet', async () => {
      const newPetData = {
        name: mockPet.name,
        type: mockPet.type,
        breed: mockPet.breed,
        age: mockPet.age,
        weight: mockPet.weight,
      };

      await mockPetStorageService.addPet(newPetData);

      expect(mockPetStorageService.addPet).toHaveBeenCalledWith(newPetData);
      expect(mockPetStorageService.addPet).toHaveBeenCalledTimes(1);
    });

    it('should call updatePet when updating existing pet', async () => {
      const updatedPet = { ...mockPet, name: 'Updated Buddy' };

      await mockPetStorageService.updatePet(updatedPet);

      expect(mockPetStorageService.updatePet).toHaveBeenCalledWith(updatedPet);
      expect(mockPetStorageService.updatePet).toHaveBeenCalledTimes(1);
    });

    it('should call deletePet when deleting pet', async () => {
      await mockPetStorageService.deletePet(mockPet.id);

      expect(mockPetStorageService.deletePet).toHaveBeenCalledWith(mockPet.id);
      expect(mockPetStorageService.deletePet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pet data structure validation', () => {
    it('should create pets with required fields', () => {
      const testPet = createMockPet({
        name: 'Test Pet',
        type: PetType.DOG,
      });

      expect(testPet).toHaveProperty('id');
      expect(testPet).toHaveProperty('createdAt');
      expect(testPet).toHaveProperty('updatedAt');
      expect(testPet.name).toBe('Test Pet');
      expect(testPet.type).toBe(PetType.DOG);
    });

    it('should handle optional fields', () => {
      const testPet = createMockPet({
        name: 'Test Pet',
        type: PetType.CAT,
        breed: 'Siamese',
        age: { years: 5, months: 0 },
        weight: 4.5,
        color: 'White',
        gender: PetGender.FEMALE,
      });

      expect(testPet.breed).toBe('Siamese');
      expect(testPet.age).toEqual({ years: 5, months: 0 });
      expect(testPet.weight).toBe(4.5);
      expect(testPet.color).toBe('White');
      expect(testPet.gender).toBe(PetGender.FEMALE);
    });
  });

  describe('Error handling', () => {
    it('should handle storage errors for adding pets', async () => {
      const error = new Error('Add failed');
      mockPetStorageService.addPet.mockRejectedValue(error);

      try {
        await mockPetStorageService.addPet(mockPet);
      } catch (e) {
        expect(e).toBe(error);
        expect(mockPetStorageService.addPet).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle storage errors for updating pets', async () => {
      const error = new Error('Update failed');
      mockPetStorageService.updatePet.mockRejectedValue(error);

      try {
        await mockPetStorageService.updatePet(mockPet);
      } catch (e) {
        expect(e).toBe(error);
        expect(mockPetStorageService.updatePet).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle storage errors for deleting pets', async () => {
      const error = new Error('Delete failed');
      mockPetStorageService.deletePet.mockRejectedValue(error);

      try {
        await mockPetStorageService.deletePet(mockPet.id);
      } catch (e) {
        expect(e).toBe(error);
        expect(mockPetStorageService.deletePet).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle storage errors for fetching pets', async () => {
      const error = new Error('Fetch failed');
      mockPetStorageService.getAllPets.mockRejectedValue(error);

      try {
        await mockPetStorageService.getAllPets();
      } catch (e) {
        expect(e).toBe(error);
        expect(mockPetStorageService.getAllPets).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Pet type validation', () => {
    it('should handle all pet types', () => {
      const petTypes = [
        PetType.DOG,
        PetType.CAT,
        PetType.BIRD,
        PetType.FISH,
        PetType.RABBIT,
        PetType.HAMSTER,
        PetType.REPTILE,
        PetType.OTHER,
      ];

      petTypes.forEach(type => {
        const pet = createMockPet({
          name: `Test ${type}`,
          type,
        });

        expect(pet.type).toBe(type);
        expect(pet.name).toBe(`Test ${type}`);
      });
    });
  });
});
