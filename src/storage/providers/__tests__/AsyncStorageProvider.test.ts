import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AsyncStorageProvider } from '../AsyncStorageProvider';
import { StorageItem } from '../../types';

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

// Mock logger
vi.mock('../../../utils/logging', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockAsyncStorage = AsyncStorage as any;

describe('AsyncStorageProvider', () => {
  let provider: AsyncStorageProvider;
  const mockItem: StorageItem<{ id: string; name: string }> = {
    data: { id: 'test-id', name: 'Test Pet' },
    metadata: {
      id: 'meta-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      version: 1,
    },
  };

  beforeEach(() => {
    provider = new AsyncStorageProvider();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize without key prefix', async () => {
      await provider.initialize();

      expect(provider.name).toBe('async-storage');
    });

    it('should initialize with key prefix', async () => {
      await provider.initialize('pet-tracker');

      // Test that the provider is initialized (we can't directly test the prefix)
      expect(provider.name).toBe('async-storage');
    });

    it('should not reinitialize if already initialized', async () => {
      await provider.initialize('prefix1');
      await provider.initialize('prefix2');

      // Should not throw and should be fine
      expect(provider.name).toBe('async-storage');
    });
  });

  describe('setItem', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should store item successfully', async () => {
      await provider.setItem('test-key', mockItem);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'test-prefix:test-key',
        expect.any(String)
      );
    });

    it('should serialize item data correctly', async () => {
      await provider.setItem('test-key', mockItem);

      const [[, serializedData]] = mockAsyncStorage.setItem.mock.calls;
      const parsed = JSON.parse(serializedData);

      expect(parsed.data).toEqual(mockItem.data);
      expect(parsed.metadata).toEqual(
        expect.objectContaining({
          id: mockItem.metadata.id,
          syncStatus: mockItem.metadata.syncStatus,
          version: mockItem.metadata.version,
        })
      );
    });

    it('should throw error if not initialized', async () => {
      const uninitializedProvider = new AsyncStorageProvider();

      await expect(uninitializedProvider.setItem('key', mockItem)).rejects.toThrow(
        'AsyncStorageProvider not initialized'
      );
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(provider.setItem('test-key', mockItem)).rejects.toThrow('Storage error');
    });
  });

  describe('getItem', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should retrieve item successfully', async () => {
      const storedData = JSON.stringify(mockItem);
      mockAsyncStorage.getItem.mockResolvedValue(storedData);

      const result = await provider.getItem('test-key');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-prefix:test-key');
      expect(result).toEqual(
        expect.objectContaining({
          data: mockItem.data,
          metadata: expect.objectContaining({
            id: mockItem.metadata.id,
            syncStatus: mockItem.metadata.syncStatus,
          }),
        })
      );
    });

    it('should return null for non-existent item', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await provider.getItem('non-existent');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await provider.getItem('test-key');
      expect(result).toBeNull();
    });

    it('should throw error if not initialized', async () => {
      const uninitializedProvider = new AsyncStorageProvider();

      await expect(uninitializedProvider.getItem('key')).rejects.toThrow(
        'AsyncStorageProvider not initialized'
      );
    });
  });

  describe('removeItem', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should remove item successfully', async () => {
      await provider.removeItem('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test-prefix:test-key');
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Remove error'));

      await expect(provider.removeItem('test-key')).rejects.toThrow('Remove error');
    });
  });

  describe('getAllKeys', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should get all keys with prefix', async () => {
      const mockKeys = [
        'test-prefix:pets:1',
        'test-prefix:pets:2',
        'other-prefix:pets:3',
        'test-prefix:health:1',
      ];
      mockAsyncStorage.getAllKeys.mockResolvedValue(mockKeys);

      const result = await provider.getAllKeys();

      expect(result).toEqual(['pets:1', 'pets:2', 'health:1']);
    });

    it('should return empty array when no keys match prefix', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['other-prefix:key']);

      const result = await provider.getAllKeys();

      expect(result).toEqual([]);
    });

    it('should handle empty prefix', async () => {
      const providerWithoutPrefix = new AsyncStorageProvider();
      await providerWithoutPrefix.initialize();

      const mockKeys = ['pets:1', 'health:1'];
      mockAsyncStorage.getAllKeys.mockResolvedValue(mockKeys);

      const result = await providerWithoutPrefix.getAllKeys();

      expect(result).toEqual(mockKeys);
    });
  });

  describe('multiGet', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should get multiple items successfully', async () => {
      const keys = ['pets:1', 'pets:2'];
      const mockData = [
        ['test-prefix:pets:1', JSON.stringify({ ...mockItem, data: { id: '1' } })],
        ['test-prefix:pets:2', JSON.stringify({ ...mockItem, data: { id: '2' } })],
      ];
      mockAsyncStorage.multiGet.mockResolvedValue(mockData);

      const result = await provider.multiGet(keys);

      expect(mockAsyncStorage.multiGet).toHaveBeenCalledWith([
        'test-prefix:pets:1',
        'test-prefix:pets:2',
      ]);
      expect(result).toHaveLength(2);
      expect(result[0][0]).toBe('pets:1');
      expect((result[0][1] as any)?.data.id).toBe('1');
      expect(result[1][0]).toBe('pets:2');
      expect((result[1][1] as any)?.data.id).toBe('2');
    });

    it('should handle null values', async () => {
      const keys = ['pets:1', 'pets:2'];
      const mockData = [
        ['test-prefix:pets:1', JSON.stringify(mockItem)],
        ['test-prefix:pets:2', null],
      ];
      mockAsyncStorage.multiGet.mockResolvedValue(mockData);

      const result = await provider.multiGet(keys);

      expect(result).toHaveLength(2);
      expect(result[0][1]).toBeTruthy();
      expect(result[1][1]).toBeNull();
    });
  });

  describe('multiSet', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should set multiple items successfully', async () => {
      const items: Array<[string, StorageItem<any>]> = [
        ['pets:1', { ...mockItem, data: { id: '1' } }],
        ['pets:2', { ...mockItem, data: { id: '2' } }],
      ];

      await provider.multiSet(items);

      expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith([
        ['test-prefix:pets:1', expect.any(String)],
        ['test-prefix:pets:2', expect.any(String)],
      ]);
    });
  });

  describe('multiRemove', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should remove multiple items successfully', async () => {
      const keys = ['pets:1', 'pets:2'];

      await provider.multiRemove(keys);

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'test-prefix:pets:1',
        'test-prefix:pets:2',
      ]);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await provider.initialize('test-prefix');
    });

    it('should clear all items with prefix', async () => {
      const mockKeys = ['test-prefix:pets:1', 'test-prefix:pets:2', 'other-prefix:pets:3'];
      mockAsyncStorage.getAllKeys.mockResolvedValue(mockKeys);

      await provider.clear();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'test-prefix:pets:1',
        'test-prefix:pets:2',
      ]);
    });

    it('should clear all items when no prefix', async () => {
      const providerWithoutPrefix = new AsyncStorageProvider();
      await providerWithoutPrefix.initialize();

      await providerWithoutPrefix.clear();

      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });
  });
});
