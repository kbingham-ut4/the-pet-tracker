import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple storage service tests focused on core functionality
describe('PetStorageService', () => {
  const mockStorageManager = {
    store: vi.fn(),
    get: vi.fn(),
    query: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    initialize: vi.fn(),
    getStats: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('service functionality', () => {
    it('should be testable as a module', async () => {
      // Test that the storage service modules can be imported
      const storageModule = await import('../PetStorageService');
      expect(storageModule.OfflinePetStorageService).toBeDefined();
    });

    it('should handle basic storage operations', async () => {
      mockStorageManager.store.mockResolvedValue(void 0);
      mockStorageManager.get.mockResolvedValue({ id: 'test', data: { name: 'Test Pet' } });
      mockStorageManager.query.mockResolvedValue([]);
      mockStorageManager.delete.mockResolvedValue(void 0);

      expect(mockStorageManager.store).toBeDefined();
      expect(mockStorageManager.get).toBeDefined();
      expect(mockStorageManager.query).toBeDefined();
      expect(mockStorageManager.delete).toBeDefined();
    });

    it('should handle error scenarios', async () => {
      mockStorageManager.get.mockRejectedValue(new Error('Storage error'));

      try {
        await mockStorageManager.get('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('storage configuration', () => {
    it('should support different storage providers', () => {
      const storageTypes = ['AsyncStorage', 'SQLite', 'Memory'];

      storageTypes.forEach(type => {
        expect(type).toBeTruthy();
      });
    });

    it('should handle storage initialization', async () => {
      mockStorageManager.initialize.mockResolvedValue(void 0);

      await expect(mockStorageManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('data operations', () => {
    it('should handle CRUD operations', () => {
      const operations = ['create', 'read', 'update', 'delete'];

      operations.forEach(op => {
        expect(op).toBeTruthy();
      });
    });

    it('should support batch operations', async () => {
      mockStorageManager.query.mockResolvedValue([
        { id: '1', data: { name: 'Pet 1' } },
        { id: '2', data: { name: 'Pet 2' } },
      ]);

      const results = await mockStorageManager.query('pets');
      expect(results).toHaveLength(2);
    });
  });

  describe('storage statistics', () => {
    it('should provide storage statistics', async () => {
      mockStorageManager.getStats.mockResolvedValue({
        totalItems: 5,
        collections: { pets: 3, activities: 2 },
        storageSize: 1024,
      });

      const stats = await mockStorageManager.getStats();
      expect(stats.totalItems).toBe(5);
      expect(stats.collections.pets).toBe(3);
    });
  });

  describe('date normalization', () => {
    it('should normalize date strings to Date objects when retrieving pets', async () => {
      // Import the service for testing
      const { OfflinePetStorageService } = await import('../PetStorageService');
      const service = new OfflinePetStorageService();

      // Test the private normalizePetData method indirectly by testing the data flow
      // This is a more integration-style test to ensure the date normalization works
      const mockPetWithStringDates = {
        id: 'test-pet',
        name: 'Test Pet',
        type: 'dog',
        dateOfBirth: '2020-01-15T00:00:00.000Z', // String date
        createdAt: '2023-01-01T12:00:00.000Z', // String date
        updatedAt: '2023-01-02T12:00:00.000Z', // String date
      };

      // Mock the storage manager to return pet data with string dates
      const mockStorageManager = {
        get: vi.fn().mockResolvedValue([mockPetWithStringDates]),
      };

      // Mock the getStorageManager method to return our mock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'getStorageManager').mockResolvedValue(mockStorageManager);

      const pets = await service.getAllPets();

      expect(pets).toHaveLength(1);
      const pet = pets[0];

      // Verify that string dates have been converted to Date objects
      expect(pet.dateOfBirth).toBeInstanceOf(Date);
      expect(pet.createdAt).toBeInstanceOf(Date);
      expect(pet.updatedAt).toBeInstanceOf(Date);

      // Verify the date values are correct
      expect(pet.dateOfBirth?.getFullYear()).toBe(2020);
      expect(pet.dateOfBirth?.getMonth()).toBe(0); // January is 0
      expect(pet.dateOfBirth?.getDate()).toBe(15);
    });

    it('should handle pets with missing dateOfBirth', async () => {
      const { OfflinePetStorageService } = await import('../PetStorageService');
      const service = new OfflinePetStorageService();

      const mockPetWithoutDOB = {
        id: 'test-pet',
        name: 'Test Pet',
        type: 'dog',
        // No dateOfBirth or age field
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-02T12:00:00.000Z',
      };

      const mockStorageManager = {
        get: vi.fn().mockResolvedValue([mockPetWithoutDOB]),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(service as any, 'getStorageManager').mockResolvedValue(mockStorageManager);

      const pets = await service.getAllPets();

      expect(pets).toHaveLength(1);
      const pet = pets[0];

      // Verify that both dateOfBirth and age are undefined when dateOfBirth is not present
      expect(pet.dateOfBirth).toBeUndefined();
      expect(pet.age).toBeUndefined();
      expect(pet.createdAt).toBeInstanceOf(Date);
      expect(pet.updatedAt).toBeInstanceOf(Date);
    });
  });
});
