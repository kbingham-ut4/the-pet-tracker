/**
 * Storage Configuration Helper
 *
 * Creates storage configuration from environment variables and provides factory methods
 */

import { StorageConfig } from './types';
import { PetTrackerStorageManager } from './StorageManager';

export class StorageConfigHelper {
  static createFromEnvironment(): StorageConfig {
    const config: StorageConfig = {
      enableLocalStorage: process.env.EXPO_PUBLIC_ENABLE_LOCAL_STORAGE === 'true',
      enableCloudSync: process.env.EXPO_PUBLIC_ENABLE_CLOUD_SYNC === 'true',
      storageProvider: 'async-storage',
      keyPrefix: process.env.EXPO_PUBLIC_STORAGE_KEY_PREFIX || 'pet_tracker',
      syncIntervalMinutes: parseInt(process.env.EXPO_PUBLIC_SYNC_INTERVAL_MINUTES || '5', 10),
      maxOfflineDays: parseInt(process.env.EXPO_PUBLIC_MAX_OFFLINE_DAYS || '30', 10),
      graphqlEndpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT,
      enableEncryption: false, // TODO: Add encryption support
      compressionEnabled: false, // TODO: Add compression support
    };

    return config;
  }

  static createDevelopmentConfig(): StorageConfig {
    return {
      enableLocalStorage: true,
      enableCloudSync: false,
      storageProvider: 'async-storage',
      keyPrefix: 'pet_tracker_dev',
      syncIntervalMinutes: 10,
      maxOfflineDays: 30,
      enableEncryption: false,
      compressionEnabled: false,
    };
  }

  static createTestingConfig(): StorageConfig {
    return {
      enableLocalStorage: true,
      enableCloudSync: false,
      storageProvider: 'memory',
      keyPrefix: 'pet_tracker_test',
      syncIntervalMinutes: 60,
      maxOfflineDays: 1,
      enableEncryption: false,
      compressionEnabled: false,
    };
  }

  static createProductionConfig(graphqlEndpoint: string): StorageConfig {
    return {
      enableLocalStorage: true,
      enableCloudSync: true,
      storageProvider: 'async-storage',
      keyPrefix: 'pet_tracker',
      syncIntervalMinutes: 2,
      maxOfflineDays: 30,
      graphqlEndpoint,
      enableEncryption: true, // Enable in production
      compressionEnabled: true,
    };
  }
}

export class StorageFactory {
  private static instance: PetTrackerStorageManager | null = null;

  static async createStorageManager(config?: StorageConfig): Promise<PetTrackerStorageManager> {
    if (StorageFactory.instance) {
      return StorageFactory.instance;
    }

    const storageConfig = config || StorageConfigHelper.createFromEnvironment();
    const manager = new PetTrackerStorageManager();
    await manager.initialize(storageConfig);

    StorageFactory.instance = manager;
    return manager;
  }

  static getInstance(): PetTrackerStorageManager {
    if (!StorageFactory.instance) {
      throw new Error('Storage manager not initialized. Call createStorageManager() first.');
    }
    return StorageFactory.instance;
  }

  static async createDevelopmentStorage(): Promise<PetTrackerStorageManager> {
    const config = StorageConfigHelper.createDevelopmentConfig();
    return this.createStorageManager(config);
  }

  static async createTestingStorage(): Promise<PetTrackerStorageManager> {
    const config = StorageConfigHelper.createTestingConfig();
    return this.createStorageManager(config);
  }

  static async createProductionStorage(graphqlEndpoint: string): Promise<PetTrackerStorageManager> {
    const config = StorageConfigHelper.createProductionConfig(graphqlEndpoint);
    return this.createStorageManager(config);
  }

  static destroyInstance(): void {
    if (StorageFactory.instance) {
      StorageFactory.instance.destroy();
      StorageFactory.instance = null;
    }
  }
}

// Convenience exports
export { PetTrackerStorageManager } from './StorageManager';
export * from './types';
export * from './services';
