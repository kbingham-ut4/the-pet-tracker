/**
 * AsyncStorage Provider
 * 
 * Local storage provider using React Native AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorageProvider, StorageItem } from '../types';
import { info, warn, error, debug } from '../../utils/logging';

export class AsyncStorageProvider implements LocalStorageProvider {
  name = 'async-storage';
  private keyPrefix: string = '';
  private initialized = false;

  async initialize(keyPrefix?: string): Promise<void> {
    if (this.initialized) return;

    this.keyPrefix = keyPrefix || '';
    this.initialized = true;

    info('AsyncStorage provider initialized', {
      context: { keyPrefix: this.keyPrefix }
    });
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  async setItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKey = this.getFullKey(key);
    
    try {
      const serializedItem = JSON.stringify({
        ...item,
        metadata: {
          ...item.metadata,
          updatedAt: new Date().toISOString(),
        }
      });

      await AsyncStorage.setItem(fullKey, serializedItem);
      
      debug('Item stored in AsyncStorage', {
        context: { key: fullKey, size: serializedItem.length }
      });
    } catch (err) {
      error('Failed to store item in AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key: fullKey }
      });
      throw err;
    }
  }

  async getItem<T>(key: string): Promise<StorageItem<T> | null> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKey = this.getFullKey(key);
    
    try {
      const serializedItem = await AsyncStorage.getItem(fullKey);
      
      if (!serializedItem) {
        debug('Item not found in AsyncStorage', { context: { key: fullKey } });
        return null;
      }

      const item: StorageItem<T> = JSON.parse(serializedItem);
      
      // Convert ISO strings back to Date objects
      item.metadata.createdAt = new Date(item.metadata.createdAt);
      item.metadata.updatedAt = new Date(item.metadata.updatedAt);
      if (item.metadata.lastSyncAt) {
        item.metadata.lastSyncAt = new Date(item.metadata.lastSyncAt);
      }

      debug('Item retrieved from AsyncStorage', {
        context: { key: fullKey, syncStatus: item.metadata.syncStatus }
      });

      return item;
    } catch (err) {
      error('Failed to retrieve item from AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key: fullKey }
      });
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKey = this.getFullKey(key);
    
    try {
      await AsyncStorage.removeItem(fullKey);
      debug('Item removed from AsyncStorage', { context: { key: fullKey } });
    } catch (err) {
      error('Failed to remove item from AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key: fullKey }
      });
      throw err;
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const filteredKeys = this.keyPrefix 
        ? allKeys.filter(key => key.startsWith(`${this.keyPrefix}:`))
                 .map(key => key.replace(`${this.keyPrefix}:`, ''))
        : [...allKeys]; // Create a mutable copy

      debug('Retrieved all keys from AsyncStorage', {
        context: { count: filteredKeys.length, keyPrefix: this.keyPrefix }
      });

      return filteredKeys;
    } catch (err) {
      error('Failed to get all keys from AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error')
      });
      throw err;
    }
  }

  async multiGet<T>(keys: string[]): Promise<Array<[string, StorageItem<T> | null]>> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKeys = keys.map(key => this.getFullKey(key));
    
    try {
      const results = await AsyncStorage.multiGet(fullKeys);
      
      const parsedResults: Array<[string, StorageItem<T> | null]> = results.map(([fullKey, value], index) => {
        const originalKey = keys[index];
        
        if (!value) {
          return [originalKey, null];
        }

        try {
          const item: StorageItem<T> = JSON.parse(value);
          
          // Convert ISO strings back to Date objects
          item.metadata.createdAt = new Date(item.metadata.createdAt);
          item.metadata.updatedAt = new Date(item.metadata.updatedAt);
          if (item.metadata.lastSyncAt) {
            item.metadata.lastSyncAt = new Date(item.metadata.lastSyncAt);
          }

          return [originalKey, item];
        } catch (parseError) {
          warn('Failed to parse stored item', {
            error: parseError instanceof Error ? parseError : new Error('Parse error'),
            context: { key: originalKey }
          });
          return [originalKey, null];
        }
      });

      debug('Multi-get completed', {
        context: { requestedCount: keys.length, retrievedCount: parsedResults.filter(([, item]) => item !== null).length }
      });

      return parsedResults;
    } catch (err) {
      error('Failed to multi-get items from AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { keyCount: keys.length }
      });
      throw err;
    }
  }

  async multiSet<T>(keyValuePairs: Array<[string, StorageItem<T>]>): Promise<void> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKeyValuePairs: Array<[string, string]> = keyValuePairs.map(([key, item]) => {
      const fullKey = this.getFullKey(key);
      const serializedItem = JSON.stringify({
        ...item,
        metadata: {
          ...item.metadata,
          updatedAt: new Date().toISOString(),
        }
      });
      return [fullKey, serializedItem];
    });

    try {
      await AsyncStorage.multiSet(fullKeyValuePairs);
      
      info('Multi-set completed', {
        context: { itemCount: keyValuePairs.length }
      });
    } catch (err) {
      error('Failed to multi-set items in AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { itemCount: keyValuePairs.length }
      });
      throw err;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    const fullKeys = keys.map(key => this.getFullKey(key));

    try {
      await AsyncStorage.multiRemove(fullKeys);
      
      info('Multi-remove completed', {
        context: { itemCount: keys.length }
      });
    } catch (err) {
      error('Failed to multi-remove items from AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { itemCount: keys.length }
      });
      throw err;
    }
  }

  async clear(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AsyncStorageProvider not initialized');
    }

    try {
      if (this.keyPrefix) {
        // Only clear items with our prefix
        const allKeys = await this.getAllKeys();
        if (allKeys.length > 0) {
          await this.multiRemove(allKeys);
        }
      } else {
        // Clear everything (use with caution!)
        await AsyncStorage.clear();
      }

      info('AsyncStorage cleared', {
        context: { keyPrefix: this.keyPrefix }
      });
    } catch (err) {
      error('Failed to clear AsyncStorage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { keyPrefix: this.keyPrefix }
      });
      throw err;
    }
  }
}
