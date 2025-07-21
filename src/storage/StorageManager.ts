/**
 * Offline Storage Manager
 * 
 * Main orchestrator for offline-first storage with cloud synchronization
 */

import { generateId } from '../utils';
import { info, warn, error, debug, getLogger } from '../utils/logging';
import {
  OfflineStorageManager,
  StorageConfig,
  StorageItem,
  StorageMetadata,
  StorageQuery,
  SyncStatus,
  SyncResult,
  StorageEventData,
  StorageEventListener,
  StorageStats,
  LocalStorageProvider,
  CloudSyncProvider,
} from './types';

export class PetTrackerStorageManager implements OfflineStorageManager {
  private config!: StorageConfig;
  private localProvider!: LocalStorageProvider;
  private cloudProvider?: CloudSyncProvider;
  private eventListeners: StorageEventListener[] = [];
  private syncInterval?: NodeJS.Timeout;
  private logger = getLogger();
  private initialized = false;

  async initialize(config: StorageConfig): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Storage manager already initialized');
      return;
    }

    this.config = config;

    // Initialize local storage provider
    const { AsyncStorageProvider } = await import('./providers/AsyncStorageProvider');
    this.localProvider = new AsyncStorageProvider();
    await this.localProvider.initialize(config.keyPrefix);

    // Initialize cloud sync provider if enabled
    if (config.enableCloudSync && config.graphqlEndpoint) {
      const { GraphQLSyncProvider } = await import('./providers/GraphQLSyncProvider');
      this.cloudProvider = new GraphQLSyncProvider();
      await this.cloudProvider.initialize({
        endpoint: config.graphqlEndpoint,
        headers: {
          // Add authentication headers here when available
        },
      });
    }

    // Start background sync if enabled
    if (config.enableCloudSync && this.cloudProvider) {
      this.startBackgroundSync();
    }

    this.initialized = true;

    info('Pet Tracker storage manager initialized', {
      context: {
        enableLocalStorage: config.enableLocalStorage,
        enableCloudSync: config.enableCloudSync,
        syncInterval: config.syncIntervalMinutes,
        keyPrefix: config.keyPrefix,
      }
    });
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  private createMetadata(userId?: string): StorageMetadata {
    return {
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending' as SyncStatus,
      version: 1,
      userId,
      deviceId: 'device-' + generateId(), // In real app, get actual device ID
    };
  }

  private emitEvent(event: StorageEventData): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        this.logger.error('Error in storage event listener', {
          error: err instanceof Error ? err : new Error('Unknown error'),
          context: { event }
        });
      }
    });
  }

  async set<T>(key: string, data: T, userId?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const existingItem = await this.localProvider.getItem<T>(key);
      const metadata: StorageMetadata = existingItem
        ? {
            ...existingItem.metadata,
            updatedAt: new Date(),
            version: existingItem.metadata.version + 1,
            syncStatus: 'pending' as SyncStatus,
            userId: userId || existingItem.metadata.userId,
          }
        : this.createMetadata(userId);

      const item: StorageItem<T> = { data, metadata };

      await this.localProvider.setItem(key, item);

      this.emitEvent({
        key,
        action: 'set',
        data,
      });

      // Try to sync immediately if cloud sync is enabled
      if (this.config.enableCloudSync && this.cloudProvider) {
        this.syncItem(key).catch(err => {
          this.logger.warn('Immediate sync failed, will retry later', {
            error: err instanceof Error ? err : new Error('Unknown error'),
            context: { key }
          });
        });
      }

      debug('Item stored successfully', {
        context: { key, version: metadata.version, syncStatus: metadata.syncStatus }
      });
    } catch (err) {
      this.emitEvent({
        key,
        action: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const item = await this.localProvider.getItem<T>(key);
      return item ? item.data : null;
    } catch (err) {
      this.logger.error('Failed to get item', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key }
      });
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      await this.localProvider.removeItem(key);

      this.emitEvent({
        key,
        action: 'remove',
      });

      // Try to delete from cloud if sync is enabled
      if (this.config.enableCloudSync && this.cloudProvider) {
        this.cloudProvider.deleteItem(key).catch(err => {
          this.logger.warn('Failed to delete item from cloud', {
            error: err instanceof Error ? err : new Error('Unknown error'),
            context: { key }
          });
        });
      }

      debug('Item removed successfully', { context: { key } });
    } catch (err) {
      this.emitEvent({
        key,
        action: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const item = await this.localProvider.getItem(key);
      return item !== null;
    } catch (err) {
      this.logger.error('Failed to check if item exists', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key }
      });
      return false;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Array<[string, T | null]>> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const results = await this.localProvider.multiGet<T>(keys);
      return results.map(([key, item]) => [key, item ? item.data : null]);
    } catch (err) {
      this.logger.error('Failed to get multiple items', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { keyCount: keys.length }
      });
      return keys.map(key => [key, null]);
    }
  }

  async setMultiple<T>(items: Array<[string, T]>, userId?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const storageItems: Array<[string, StorageItem<T>]> = await Promise.all(
        items.map(async ([key, data]) => {
          const existingItem = await this.localProvider.getItem<T>(key);
          const metadata: StorageMetadata = existingItem
            ? {
                ...existingItem.metadata,
                updatedAt: new Date(),
                version: existingItem.metadata.version + 1,
                syncStatus: 'pending' as SyncStatus,
                userId: userId || existingItem.metadata.userId,
              }
            : this.createMetadata(userId);

          return [key, { data, metadata }];
        })
      );

      await this.localProvider.multiSet(storageItems);

      // Emit events for all items
      items.forEach(([key, data]) => {
        this.emitEvent({
          key,
          action: 'set',
          data,
        });
      });

      info('Multiple items stored successfully', {
        context: { itemCount: items.length }
      });
    } catch (err) {
      this.logger.error('Failed to set multiple items', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { itemCount: items.length }
      });
      throw err;
    }
  }

  async removeMultiple(keys: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      await this.localProvider.multiRemove(keys);

      // Emit events for all keys
      keys.forEach(key => {
        this.emitEvent({
          key,
          action: 'remove',
        });
      });

      info('Multiple items removed successfully', {
        context: { itemCount: keys.length }
      });
    } catch (err) {
      this.logger.error('Failed to remove multiple items', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { itemCount: keys.length }
      });
      throw err;
    }
  }

  async query<T>(query: StorageQuery): Promise<Array<[string, T]>> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      const allKeys = await this.localProvider.getAllKeys();
      let filteredKeys = allKeys;

      // Apply key filtering
      if (query.key) {
        filteredKeys = filteredKeys.filter(key => key === query.key);
      } else if (query.keyPrefix) {
        filteredKeys = filteredKeys.filter(key => key.startsWith(query.keyPrefix!));
      }

      // Apply pagination
      if (query.offset) {
        filteredKeys = filteredKeys.slice(query.offset);
      }
      if (query.limit) {
        filteredKeys = filteredKeys.slice(0, query.limit);
      }

      const results = await this.localProvider.multiGet<T>(filteredKeys);
      const filteredResults: Array<[string, T]> = [];

      for (const [key, item] of results) {
        if (item) {
          // Apply additional filters
          if (query.syncStatus && item.metadata.syncStatus !== query.syncStatus) {
            continue;
          }
          if (query.userId && item.metadata.userId !== query.userId) {
            continue;
          }

          filteredResults.push([key, item.data]);
        }
      }

      debug('Query completed', {
        context: {
          totalKeys: allKeys.length,
          filteredKeys: filteredKeys.length,
          results: filteredResults.length,
        }
      });

      return filteredResults;
    } catch (err) {
      this.logger.error('Query failed', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { query }
      });
      return [];
    }
  }

  async getAll<T>(keyPrefix?: string): Promise<Array<[string, T]>> {
    return this.query<T>({ keyPrefix });
  }

  async sync(): Promise<SyncResult> {
    if (!this.config.enableCloudSync || !this.cloudProvider) {
      this.logger.warn('Cloud sync is disabled or not configured');
      return {
        success: false,
        itemsProcessed: 0,
        itemsSynced: 0,
        itemsConflicted: 0,
        errors: [{
          key: 'config',
          error: 'Cloud sync not enabled',
          timestamp: new Date(),
        }],
      };
    }

    try {
      // Get all items that need syncing
      const pendingItems = await this.query<any>({ syncStatus: 'pending' });
      const keys = pendingItems.map(([key]) => key);

      info('Starting sync operation', {
        context: { pendingItemCount: keys.length }
      });

      const result = await this.cloudProvider.syncItems(keys);

      this.emitEvent({
        key: 'sync',
        action: 'sync',
        data: result,
      });

      return result;
    } catch (err) {
      this.logger.error('Sync operation failed', {
        error: err instanceof Error ? err : new Error('Unknown error')
      });

      return {
        success: false,
        itemsProcessed: 0,
        itemsSynced: 0,
        itemsConflicted: 0,
        errors: [{
          key: 'sync',
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date(),
        }],
      };
    }
  }

  async syncItem(key: string): Promise<boolean> {
    if (!this.config.enableCloudSync || !this.cloudProvider) {
      return false;
    }

    try {
      const item = await this.localProvider.getItem(key);
      if (!item) {
        return false;
      }

      await this.cloudProvider.uploadItem(key, item);

      // Update sync status
      item.metadata.syncStatus = 'synced';
      item.metadata.lastSyncAt = new Date();
      await this.localProvider.setItem(key, item);

      return true;
    } catch (err) {
      this.logger.error('Item sync failed', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key }
      });
      return false;
    }
  }

  async getSyncStatus(key: string): Promise<SyncStatus> {
    try {
      const item = await this.localProvider.getItem(key);
      return item ? item.metadata.syncStatus : 'error';
    } catch (err) {
      return 'error';
    }
  }

  addEventListener(listener: StorageEventListener): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: StorageEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  async cleanup(): Promise<void> {
    if (!this.initialized) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.maxOfflineDays);

      const allItems = await this.query<any>({});
      const keysToRemove: string[] = [];

      for (const [key, data] of allItems) {
        const item = await this.localProvider.getItem(key);
        if (item && item.metadata.updatedAt < cutoffDate) {
          keysToRemove.push(key);
        }
      }

      if (keysToRemove.length > 0) {
        await this.removeMultiple(keysToRemove);
        info('Cleanup completed', {
          context: { removedItems: keysToRemove.length }
        });
      }
    } catch (err) {
      this.logger.error('Cleanup failed', {
        error: err instanceof Error ? err : new Error('Unknown error')
      });
    }
  }

  async getStats(): Promise<StorageStats> {
    try {
      const allKeys = await this.localProvider.getAllKeys();
      const allItems = await this.localProvider.multiGet(allKeys);
      
      let pendingSync = 0;
      let syncErrors = 0;
      let lastSyncAt: Date | undefined;
      let oldestItem: Date | undefined;
      let newestItem: Date | undefined;
      let storageSize = 0;

      for (const [key, item] of allItems) {
        if (item) {
          if (item.metadata.syncStatus === 'pending') pendingSync++;
          if (item.metadata.syncStatus === 'error') syncErrors++;
          
          if (item.metadata.lastSyncAt && (!lastSyncAt || item.metadata.lastSyncAt > lastSyncAt)) {
            lastSyncAt = item.metadata.lastSyncAt;
          }
          
          if (!oldestItem || item.metadata.createdAt < oldestItem) {
            oldestItem = item.metadata.createdAt;
          }
          
          if (!newestItem || item.metadata.createdAt > newestItem) {
            newestItem = item.metadata.createdAt;
          }

          // Rough estimate of storage size
          storageSize += JSON.stringify(item).length;
        }
      }

      return {
        totalItems: allItems.length,
        pendingSync,
        syncErrors,
        lastSyncAt,
        storageSize,
        oldestItem,
        newestItem,
      };
    } catch (err) {
      this.logger.error('Failed to get storage stats', {
        error: err instanceof Error ? err : new Error('Unknown error')
      });
      
      return {
        totalItems: 0,
        pendingSync: 0,
        syncErrors: 0,
        storageSize: 0,
      };
    }
  }

  async clear(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage manager not initialized');
    }

    try {
      await this.localProvider.clear();
      
      this.emitEvent({
        key: 'all',
        action: 'remove',
      });

      info('Storage cleared successfully');
    } catch (err) {
      this.logger.error('Failed to clear storage', {
        error: err instanceof Error ? err : new Error('Unknown error')
      });
      throw err;
    }
  }

  private startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const intervalMs = this.config.syncIntervalMinutes * 60 * 1000;
    
    this.syncInterval = setInterval(() => {
      this.sync().catch(err => {
        this.logger.warn('Background sync failed', {
          error: err instanceof Error ? err : new Error('Unknown error')
        });
      });
    }, intervalMs);

    debug('Background sync started', {
      context: { intervalMinutes: this.config.syncIntervalMinutes }
    });
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.eventListeners = [];
    this.initialized = false;
    
    info('Storage manager destroyed');
  }
}
