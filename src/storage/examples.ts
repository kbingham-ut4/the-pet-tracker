/**
 * Storage System Usage Examples
 *
 * This file demonstrates how to use the offline-first storage system
 * with cloud synchronization for the Pet Tracker app.
 */

/* eslint-disable no-console */

// Import the storage system
import {
  StorageFactory,
  StorageConfigHelper,
  PetTrackerStorageManager as _PetTrackerStorageManager,
} from './index';
import { OfflinePetStorageService } from './services';
import { Pet, PetType } from '../types';
import { info, error } from '../utils/logger';

/**
 * Basic Storage Operations
 */
export const basicStorageExamples = async () => {
  // Initialize storage manager
  const storage = await StorageFactory.createStorageManager();

  // Store simple data
  await storage.set('user_preferences', {
    theme: 'dark',
    notifications: true,
    language: 'en',
  });

  // Retrieve data
  const preferences = await storage.get('user_preferences');
  console.log('User preferences:', preferences);

  // Store array data
  const petActivities = [
    { id: '1', petId: 'pet_123', type: 'walk', duration: 30 },
    { id: '2', petId: 'pet_123', type: 'feeding', amount: '200g' },
  ];
  await storage.set('pet_activities', petActivities);

  // Query data
  const activities = await storage.query({
    keyPrefix: 'pet_',
    limit: 10,
  });
  console.log('Pet-related data:', activities);
};

/**
 * Pet-Specific Storage Service
 */
export const petStorageExamples = async () => {
  // Initialize pet storage service
  const petService = new OfflinePetStorageService();

  // Add a new pet
  const newPet = await petService.addPet({
    name: 'Buddy',
    type: PetType.DOG,
    breed: 'Golden Retriever',
    age: 3,
    weight: 30,
    color: 'Golden',
    gender: 'male',
    ownerId: 'user_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('New pet added:', newPet);

  // Get all pets for a user
  const userPets = await petService.getAllPets('user_123');
  console.log('User pets:', userPets);

  // Update a pet
  const updatedPet = await petService.updatePet(newPet.id, {
    weight: 32,
    ownerNotes: 'Gained 2 pounds this month',
  });

  console.log('Pet updated:', updatedPet);

  // Check sync status
  const syncStatus = await petService.getPetSyncStatus(newPet.id);
  console.log('Sync status:', syncStatus);
};

/**
 * Offline-First Patterns
 */
export const offlineFirstExamples = async () => {
  const storage = await StorageFactory.createStorageManager();

  // Always store locally first
  const saveUserAction = async (action: Record<string, unknown> & { id: string }) => {
    try {
      // Save immediately to local storage
      await storage.set(`action_${action.id}`, action);
      info('Action saved locally', { context: { actionId: action.id } });

      // Try to sync to cloud (non-blocking)
      storage.syncItem(`action_${action.id}`).catch(err => {
        info('Action will sync later when connection is available', {
          context: { actionId: action.id, error: err.message },
        });
      });

      return { success: true, stored: 'local', synced: 'pending' };
    } catch (err) {
      error('Failed to save action', { error: err, context: { action } });
      throw err;
    }
  };

  // Example usage
  const userAction = {
    id: 'action_123',
    type: 'pet_feeding',
    petId: 'pet_456',
    timestamp: new Date(),
    data: { foodType: 'kibble', amount: '200g' },
  };

  await saveUserAction(userAction);
};

/**
 * Batch Operations for Performance
 */
export const batchOperationExamples = async () => {
  const storage = await StorageFactory.createStorageManager();

  // Batch insert multiple items
  const batchData: Array<[string, Record<string, unknown>]> = [
    ['pet_feeding_1', { petId: 'pet_123', time: new Date(), amount: '200g' }],
    ['pet_feeding_2', { petId: 'pet_123', time: new Date(), amount: '180g' }],
    ['pet_feeding_3', { petId: 'pet_123', time: new Date(), amount: '220g' }],
  ];

  await storage.setMultiple(batchData, 'user_123');
  info('Batch data saved', { context: { itemCount: batchData.length } });

  // Batch retrieve
  const keys = ['pet_feeding_1', 'pet_feeding_2', 'pet_feeding_3'];
  const results = await storage.getMultiple(keys);
  console.log('Batch results:', results);
};

/**
 * Sync Management
 */
export const syncManagementExamples = async () => {
  const storage = await StorageFactory.createStorageManager();

  // Manual sync trigger
  const performSync = async () => {
    try {
      const result = await storage.sync();

      if (result.success) {
        info('Sync completed successfully', {
          context: {
            itemsProcessed: result.itemsProcessed,
            itemsSynced: result.itemsSynced,
            conflicts: result.itemsConflicted,
          },
        });
      } else {
        info('Sync completed with errors', {
          context: {
            errors: result.errors.length,
            details: result.errors,
          },
        });
      }

      return result;
    } catch (err) {
      error('Sync failed', { error: err });
      throw err;
    }
  };

  // Listen for storage events
  const handleStorageEvent = (event: {
    action: string;
    key: string;
    error?: string;
    data?: unknown;
  }) => {
    switch (event.action) {
      case 'set':
        info('Data stored', { context: { key: event.key } });
        break;
      case 'sync':
        info('Sync completed', { context: event.data });
        break;
      case 'error':
        error('Storage error', { context: { key: event.key, error: event.error } });
        break;
    }
  };

  storage.addEventListener(handleStorageEvent);

  // Trigger sync
  await performSync();

  // Clean up listener
  storage.removeEventListener(handleStorageEvent);
};

/**
 * Environment-Specific Configuration
 */
export const configurationExamples = async () => {
  // Development configuration (local only)
  if (__DEV__) {
    const devStorage = await StorageFactory.createDevelopmentStorage();
    console.log('Development storage initialized');

    // All data stays local for faster development
    await devStorage.set('dev_data', { testing: true });
  }

  // Production configuration (with cloud sync)
  const prodEndpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT;
  if (prodEndpoint && !__DEV__) {
    const _prodStorage = await StorageFactory.createProductionStorage(prodEndpoint);
    console.log('Production storage with cloud sync initialized');
  }

  // Custom configuration
  const customConfig = StorageConfigHelper.createFromEnvironment();
  const customStorage = await StorageFactory.createStorageManager(customConfig);
  console.log('Custom storage configuration:', customStorage.getConfig());
};

/**
 * Error Handling and Recovery
 */
export const errorHandlingExamples = async () => {
  const storage = await StorageFactory.createStorageManager();

  // Graceful error handling
  const safeStorageOperation = async (key: string, data: unknown) => {
    try {
      await storage.set(key, data);
      return { success: true };
    } catch (err) {
      error('Storage operation failed, data may be lost', {
        error: err,
        context: { key, dataType: typeof data },
      });

      // Could implement recovery strategies here:
      // 1. Retry with exponential backoff
      // 2. Store in memory queue for later retry
      // 3. Notify user about the issue

      return { success: false, error: err };
    }
  };

  // Network-aware operations
  const networkAwareSync = async () => {
    const config = storage.getConfig();

    if (!config.enableCloudSync) {
      info('Cloud sync disabled, skipping');
      return;
    }

    try {
      // Check connectivity before attempting sync
      const result = await storage.sync();

      if (!result.success && result.errors.some(e => e.error.includes('network'))) {
        info('Network unavailable, will retry later');
        // Schedule retry or show user notification
      }
    } catch {
      info('Sync will be retried in background');
    }
  };

  await safeStorageOperation('test_data', { value: 123 });
  await networkAwareSync();
};

/**
 * Storage Maintenance
 */
export const maintenanceExamples = async () => {
  const storage = await StorageFactory.createStorageManager();

  // Get storage statistics
  const stats = await storage.getStats();
  console.log('Storage stats:', {
    totalItems: stats.totalItems,
    pendingSync: stats.pendingSync,
    storageSize: `${Math.round(stats.storageSize / 1024)}KB`,
    syncErrors: stats.syncErrors,
  });

  // Clean up old data
  await storage.cleanup();
  info('Storage cleanup completed');

  // Export data for backup
  const petService = new OfflinePetStorageService();
  const allPets = await petService.exportPets();
  console.log(`Exported ${allPets.length} pets for backup`);
};

/**
 * React Component Integration
 */
export const componentIntegrationExample = () => {
  // Example React component that uses storage
  const PetListComponent = () => {
    const [pets, setPets] = React.useState<Pet[]>([]);
    const [syncStatus, setSyncStatus] = React.useState<string>('idle');

    const petService = React.useMemo(() => new OfflinePetStorageService(), []);

    React.useEffect(() => {
      const loadPets = async () => {
        try {
          const userPets = await petService.getAllPets();
          setPets(userPets);
        } catch (err) {
          error('Failed to load pets', { error: err });
        }
      };

      loadPets();
    }, [petService]);

    const handleAddPet = async (petData: Omit<Pet, 'id'>) => {
      try {
        setSyncStatus('saving');
        const newPet = await petService.addPet(petData);
        setPets(prev => [...prev, newPet]);
        setSyncStatus('saved');

        // Check sync status
        const status = await petService.getPetSyncStatus(newPet.id);
        setSyncStatus(status);
      } catch (err) {
        setSyncStatus('error');
        error('Failed to add pet', { error: err });
      }
    };

    const handleSync = async () => {
      try {
        setSyncStatus('syncing');
        await petService.syncPets();
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('sync_error');
        error('Sync failed', { error: err });
      }
    };

    return {
      pets,
      syncStatus,
      handleAddPet,
      handleSync,
    };
  };

  return PetListComponent;
};

import React from 'react';
