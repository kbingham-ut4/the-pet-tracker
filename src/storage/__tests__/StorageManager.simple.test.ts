import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PetTrackerStorageManager } from '../StorageManager';
import { StorageConfig, StorageQuery } from '../types';
import { mockPet } from '../../test/test-utils';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    getAllKeys: vi.fn(),
    multiGet: vi.fn(),
    multiSet: vi.fn(),
    multiRemove: vi.fn(),
    clear: vi.fn(),
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockAsyncStorage = AsyncStorage as any;

// Mock logger
vi.mock('../../utils/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

describe('PetTrackerStorageManager', () => {
  let storageManager: PetTrackerStorageManager;
  let mockConfig: StorageConfig;

  beforeEach(() => {
    storageManager = new PetTrackerStorageManager();
    mockConfig = {
      enableLocalStorage: true,
      enableCloudSync: false,
      storageProvider: 'async-storage',
      keyPrefix: 'pet-tracker-test',
      syncIntervalMinutes: 30,
      maxOfflineDays: 7,
    };

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock returns
    mockAsyncStorage.setItem.mockResolvedValue(void 0);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.removeItem.mockResolvedValue(void 0);
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    mockAsyncStorage.clear.mockResolvedValue(void 0);
    mockAsyncStorage.multiGet.mockResolvedValue([]);
    mockAsyncStorage.multiSet.mockResolvedValue(void 0);
    mockAsyncStorage.multiRemove.mockResolvedValue(void 0);
  });

  describe('initialization', () => {
    it('should initialize successfully with basic config', async () => {
      await expect(storageManager.initialize(mockConfig)).resolves.not.toThrow();
    });

    it('should initialize with cloud sync when enabled', async () => {
      const configWithSync: StorageConfig = {
        ...mockConfig,
        enableCloudSync: true,
        graphqlEndpoint: 'https://api.example.com/graphql',
      };

      await expect(storageManager.initialize(configWithSync)).resolves.not.toThrow();
    });

    it('should return the config after initialization', async () => {
      await storageManager.initialize(mockConfig);

      const config = storageManager.getConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('basic storage operations', () => {
    beforeEach(async () => {
      await storageManager.initialize(mockConfig);
    });

    it('should store an item successfully', async () => {
      await expect(storageManager.set(`pets:${mockPet.id}`, mockPet)).resolves.not.toThrow();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should retrieve an item successfully', async () => {
      const storedData = JSON.stringify({
        data: mockPet,
        metadata: {
          id: mockPet.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'synced',
          version: 1,
        },
      });

      mockAsyncStorage.getItem.mockResolvedValue(storedData);

      const result = await storageManager.get<typeof mockPet>(`pets:${mockPet.id}`);

      expect(result).toBeTruthy();
      expect(result?.name).toBe(mockPet.name);
    });

    it('should return null for non-existent item', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await storageManager.get('pets:non-existent-id');

      expect(result).toBeNull();
    });

    it('should remove an item successfully', async () => {
      await expect(storageManager.remove(`pets:${mockPet.id}`)).resolves.not.toThrow();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should check if item exists', async () => {
      // Mock that an item exists by returning a proper StorageItem structure
      const mockStorageItem = JSON.stringify({
        data: mockPet,
        metadata: {
          id: 'test-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
          version: 1,
        },
      });
      mockAsyncStorage.getItem.mockResolvedValue(mockStorageItem);

      const exists = await storageManager.exists(`pets:${mockPet.id}`);
      expect(exists).toBe(true);

      mockAsyncStorage.getItem.mockResolvedValue(null);
      const notExists = await storageManager.exists(`pets:non-existent`);
      expect(notExists).toBe(false);
    });

    it('should clear all data successfully', async () => {
      await expect(storageManager.clear()).resolves.not.toThrow();
    });
  });

  describe('batch operations', () => {
    beforeEach(async () => {
      await storageManager.initialize(mockConfig);
    });

    it('should get multiple items', async () => {
      const keys = [`pets:${mockPet.id}`, 'pets:pet2'];

      await expect(storageManager.getMultiple(keys)).resolves.toBeDefined();
      expect(mockAsyncStorage.multiGet).toHaveBeenCalled();
    });

    it('should set multiple items', async () => {
      const items: Array<[string, typeof mockPet]> = [
        [`pets:${mockPet.id}`, mockPet],
        ['pets:pet2', { ...mockPet, id: 'pet2', name: 'Rex' }],
      ];

      await expect(storageManager.setMultiple(items)).resolves.not.toThrow();
      expect(mockAsyncStorage.multiSet).toHaveBeenCalled();
    });

    it('should remove multiple items', async () => {
      const keys = [`pets:${mockPet.id}`, 'pets:pet2'];

      await expect(storageManager.removeMultiple(keys)).resolves.not.toThrow();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('query operations', () => {
    beforeEach(async () => {
      await storageManager.initialize(mockConfig);
    });

    it('should query items with key prefix', async () => {
      const query: StorageQuery = {
        keyPrefix: 'pets:',
        limit: 10,
      };

      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'pet-tracker-test:pets:1',
        'pet-tracker-test:pets:2',
      ]);
      mockAsyncStorage.multiGet.mockResolvedValue([
        ['pet-tracker-test:pets:1', JSON.stringify({ data: mockPet, metadata: {} })],
        [
          'pet-tracker-test:pets:2',
          JSON.stringify({ data: { ...mockPet, id: 'pet2' }, metadata: {} }),
        ],
      ]);

      const results = await storageManager.query(query);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should get all items with prefix', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'pet-tracker-test:pets:1',
        'pet-tracker-test:pets:2',
      ]);
      mockAsyncStorage.multiGet.mockResolvedValue([]);

      const results = await storageManager.getAll('pets:');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('statistics and maintenance', () => {
    beforeEach(async () => {
      await storageManager.initialize(mockConfig);
    });

    it('should return storage statistics', async () => {
      const stats = await storageManager.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalItems).toBe('number');
      expect(typeof stats.pendingSync).toBe('number');
      expect(typeof stats.syncErrors).toBe('number');
      expect(typeof stats.storageSize).toBe('number');
    });

    it('should run cleanup', async () => {
      await expect(storageManager.cleanup()).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await storageManager.initialize(mockConfig);
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await expect(storageManager.set(`pets:${mockPet.id}`, mockPet)).rejects.toThrow(
        'Storage full'
      );
    });

    it('should handle retrieval errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Read error'));

      // StorageManager.get() catches errors and returns null for graceful handling
      const result = await storageManager.get(`pets:${mockPet.id}`);
      expect(result).toBe(null);
    });
  });
});
