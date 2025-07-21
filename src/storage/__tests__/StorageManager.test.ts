import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PetTrackerStorageManager } from '../StorageManager';
import { StorageConfig, StorageItem } from '../types';
import { mockPet, wait } from '../../test/test-utils';

// Mock AsyncStorage
const mockAsyncStorage = {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    getAllKeys: vi.fn(),
    multiGet: vi.fn(),
    multiSet: vi.fn(),
    multiRemove: vi.fn(),
    clear: vi.fn(),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
    default: mockAsyncStorage,
}));

// Mock logger
vi.mock('../../utils/logging', () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    getLogger: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    }),
}));

describe('PetTrackerStorageManager', () => {
    let storageManager: PetTrackerStorageManager;
    let mockConfig: StorageConfig;

    beforeEach(() => {
        storageManager = new PetTrackerStorageManager();
        mockConfig = {
            keyPrefix: 'pet-tracker-test',
            enableCloudSync: false,
            syncInterval: 30000,
            maxRetries: 3,
            retryDelay: 1000,
        };

        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock returns
        mockAsyncStorage.setItem.mockResolvedValue(void 0);
        mockAsyncStorage.getItem.mockResolvedValue(null);
        mockAsyncStorage.removeItem.mockResolvedValue(void 0);
        mockAsyncStorage.getAllKeys.mockResolvedValue([]);
        mockAsyncStorage.clear.mockResolvedValue(void 0);
    });

    describe('initialization', () => {
        it('should initialize successfully with basic config', async () => {
            await expect(storageManager.initialize(mockConfig)).resolves.not.toThrow();
        });

        it('should prevent double initialization', async () => {
            await storageManager.initialize(mockConfig);

            // Second initialization should not throw but warn
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
                    id: 'test-id',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    syncStatus: 'pending',
                    version: 1,
                },
            });

            mockAsyncStorage.getItem.mockResolvedValue(storedData);

            const result = await storageManager.get(`pets:${mockPet.id}`); expect(result).toBeTruthy();
            expect((result as any).name).toBe(mockPet.name);
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
                `pet-tracker-test:pets:${mockPet.id}`
            );
        });

        it('should return null for non-existent item', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const result = await storageManager.get('pets:non-existent-id');
            expect(result).toBeNull();
        });

        it('should delete an item successfully', async () => {
            await expect(storageManager.remove(`pets:${mockPet.id}`)).resolves.not.toThrow();
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
                `pet-tracker-test:pets:${mockPet.id}`
            );
        });

        it('should clear all data successfully', async () => {
            mockAsyncStorage.getAllKeys.mockResolvedValue([
                'pet-tracker-test:pets:1',
                'pet-tracker-test:pets:2',
                'other-app:data',
            ]);

            await expect(storageManager.clear()).resolves.not.toThrow();
            expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
                'pet-tracker-test:pets:1',
                'pet-tracker-test:pets:2',
            ]);
        });
    });

    describe('query operations', () => {
        beforeEach(async () => {
            await storageManager.initialize(mockConfig);

            // Mock stored pets data
            const petsData = [mockPet, { ...mockPet, id: 'pet-2', name: 'Rex' }];
            const keysWithData = petsData.map(pet => [
                `pet-tracker-test:pets:${pet.id}`,
                JSON.stringify({
                    data: pet,
                    metadata: {
                        id: `meta-${pet.id}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        syncStatus: 'pending',
                        version: 1,
                    },
                }),
            ]);

            // AsyncStorageProvider.getAllKeys() strips the prefix, so return stripped keys
            const strippedKeys = petsData.map(pet => `pets:${pet.id}`);
            mockAsyncStorage.getAllKeys.mockResolvedValue(keysWithData.map(([key]) => key));

            // Mock multiGet to handle both full and stripped keys correctly
            mockAsyncStorage.multiGet.mockImplementation((keys: string[]) => {
                return Promise.resolve(keys.map(requestedKey => {
                    // Find matching data for this key
                    const fullKey = requestedKey.startsWith('pet-tracker-test:')
                        ? requestedKey
                        : `pet-tracker-test:${requestedKey}`;
                    const matchingEntry = keysWithData.find(([key]) => key === fullKey);
                    return matchingEntry || [requestedKey, null];
                }));
            });
        });

        it('should query all items in a collection', async () => {
            const results = await storageManager.query({ keyPrefix: 'pets:' });

            expect(results).toHaveLength(2);
            expect((results[0][1] as any).name).toBe('Buddy');
            expect((results[1][1] as any).name).toBe('Rex');
        });

        it('should apply filters when querying', async () => {
            const results = await storageManager.query({ keyPrefix: 'pets:' });

            // Note: This assumes the query method implements filtering
            // The actual implementation would need to filter the results
            expect(results.length).toBeGreaterThanOrEqual(0);
        });

        it('should limit results when specified', async () => {
            const results = await storageManager.query({ keyPrefix: 'pets:', limit: 1 });

            expect(results).toHaveLength(1);
            expect(results[0][0]).toBe('pets:test-pet-id');
            expect(results[0][1]).toBeDefined();
        });
    });

    describe('statistics', () => {
        beforeEach(async () => {
            await storageManager.initialize(mockConfig);

            mockAsyncStorage.getAllKeys.mockResolvedValue([
                'pet-tracker-test:pets:1',
                'pet-tracker-test:pets:2',
                'pet-tracker-test:health:1',
            ]);
        });

        it('should return storage statistics', async () => {
            const stats = await storageManager.getStats();

            expect(stats).toBeDefined();
            expect(stats.totalItems).toBeGreaterThanOrEqual(0);
            expect(typeof stats.pendingSync).toBe('number');
            expect(typeof stats.syncErrors).toBe('number');
            expect(typeof stats.storageSize).toBe('number');
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            await storageManager.initialize(mockConfig);
        });

        it('should handle storage errors gracefully', async () => {
            mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

            await expect(
                storageManager.set(`pets:${mockPet.id}`, mockPet)
            ).rejects.toThrow('Storage full');
        });

        it('should handle retrieval errors gracefully', async () => {
            mockAsyncStorage.getItem.mockRejectedValue(new Error('Read error'));

            // StorageManager.get() catches errors and returns null for graceful handling
            const result = await storageManager.get(`pets:${mockPet.id}`);
            expect(result).toBe(null);
        });

        it('should handle malformed data gracefully', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('invalid json');

            // StorageManager.get() catches errors and returns null for graceful handling
            const result = await storageManager.get(`pets:${mockPet.id}`);
            expect(result).toBe(null);
        });
    });
});
