/**
 * Pet Storage Service
 *
 * High-level service for managing pet data with offline storage and cloud sync
 */

import { Pet, PetType as _PetType } from '../../types';
import { StorageFactory } from '../index';
import { info, warn, error, debug } from '../../utils/logger';
import { generateId } from '../../utils';

// Basic interfaces for related data
interface BaseRecord {
  petId: string;
  [key: string]: unknown;
}

interface Activity extends BaseRecord {
  id: string;
  type: string;
  date: string;
}

interface HealthRecord extends BaseRecord {
  id: string;
  type: string;
  date: string;
}

interface FoodLog extends BaseRecord {
  id: string;
  date: string;
  amount: number;
}

interface WeightRecord extends BaseRecord {
  id: string;
  date: string;
  weight: number;
}

export interface PetStorageService {
  // Pet management
  getAllPets(_userId?: string): Promise<Pet[]>;
  getPet(_petId: string): Promise<Pet | null>;
  addPet(_pet: Omit<Pet, 'id'>): Promise<Pet>;
  updatePet(_petId: string, _updates: Partial<Pet>): Promise<Pet>;
  deletePet(_petId: string): Promise<void>;

  // Sync operations
  syncPets(): Promise<void>;
  getPetSyncStatus(_petId: string): Promise<string>;

  // Utility
  exportPets(): Promise<Pet[]>;
  importPets(_pets: Pet[]): Promise<void>;
}

export class OfflinePetStorageService implements PetStorageService {
  // Logger functions are imported directly
  private readonly PETS_KEY = 'pets';

  private async getStorageManager() {
    return StorageFactory.getInstance();
  }

  async getAllPets(userId?: string): Promise<Pet[]> {
    try {
      const storage = await this.getStorageManager();
      const pets = await storage.get<Pet[]>(this.PETS_KEY);

      if (!pets || !Array.isArray(pets)) {
        debug('No pets found in storage');
        return [];
      }

      // Normalize date fields and filter by user if specified
      const normalizedPets = pets.map(pet => this.normalizePetData(pet));
      const filteredPets = userId
        ? normalizedPets.filter(pet => pet.ownerId === userId)
        : normalizedPets;

      info('Pets retrieved from storage', {
        context: {
          totalCount: pets.length,
          filteredCount: filteredPets.length,
          userId,
        },
      });

      return filteredPets;
    } catch (err) {
      error('Failed to get pets from storage', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { userId },
      });
      return [];
    }
  }

  async getPet(petId: string): Promise<Pet | null> {
    try {
      const pets = await this.getAllPets();
      const pet = pets.find(p => p.id === petId);

      if (pet) {
        debug('Pet found', { context: { petId, petName: pet.name } });
        return this.normalizePetData(pet);
      } else {
        debug('Pet not found', { context: { petId } });
        return null;
      }
    } catch (err) {
      error('Failed to get pet', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petId },
      });
      return null;
    }
  }

  async addPet(petData: Omit<Pet, 'id'>): Promise<Pet> {
    try {
      const newPet: Pet = {
        id: generateId(),
        ...petData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const storage = await this.getStorageManager();
      const existingPets = await this.getAllPets();
      const updatedPets = [...existingPets, newPet];

      await storage.set(this.PETS_KEY, updatedPets, petData.ownerId);

      info('Pet added successfully', {
        context: {
          petId: newPet.id,
          petName: newPet.name,
          petType: newPet.type,
          ownerId: petData.ownerId,
        },
      });

      return newPet;
    } catch (err) {
      error('Failed to add pet', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petName: petData.name, petType: petData.type },
      });
      throw err;
    }
  }

  async updatePet(petId: string, updates: Partial<Pet>): Promise<Pet> {
    try {
      const storage = await this.getStorageManager();
      const existingPets = await this.getAllPets();
      const petIndex = existingPets.findIndex(p => p.id === petId);

      if (petIndex === -1) {
        throw new Error(`Pet with ID ${petId} not found`);
      }

      const existingPet = existingPets[petIndex];
      const updatedPet: Pet = {
        ...existingPet,
        ...updates,
        id: petId, // Ensure ID cannot be changed
        updatedAt: new Date(),
      };

      const updatedPets = [...existingPets];
      updatedPets[petIndex] = updatedPet;

      await storage.set(this.PETS_KEY, updatedPets, existingPet.ownerId);

      info('Pet updated successfully', {
        context: {
          petId,
          petName: updatedPet.name,
          updatedFields: Object.keys(updates),
        },
      });

      return updatedPet;
    } catch (err) {
      error('Failed to update pet', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petId, updates: Object.keys(updates) },
      });
      throw err;
    }
  }

  async deletePet(petId: string): Promise<void> {
    try {
      const storage = await this.getStorageManager();
      const existingPets = await this.getAllPets();
      const petToDelete = existingPets.find(p => p.id === petId);

      if (!petToDelete) {
        warn('Attempted to delete non-existent pet', { context: { petId } });
        return;
      }

      const updatedPets = existingPets.filter(p => p.id !== petId);
      await storage.set(this.PETS_KEY, updatedPets, petToDelete.ownerId);

      // TODO: Clean up related data (activities, health records, etc.)
      await this.cleanupRelatedData(petId);

      info('Pet deleted successfully', {
        context: {
          petId,
          petName: petToDelete.name,
          relatedDataCleanup: true,
        },
      });
    } catch (err) {
      error('Failed to delete pet', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petId },
      });
      throw err;
    }
  }

  async syncPets(): Promise<void> {
    try {
      const storage = await this.getStorageManager();
      const result = await storage.sync();

      if (result.success) {
        info('Pet sync completed successfully', {
          context: {
            itemsProcessed: result.itemsProcessed,
            itemsSynced: result.itemsSynced,
            errors: result.errors.length,
          },
        });
      } else {
        warn('Pet sync completed with errors', {
          context: {
            itemsProcessed: result.itemsProcessed,
            errors: result.errors.length,
          },
        });
      }
    } catch (err) {
      error('Pet sync failed', {
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
      throw err;
    }
  }

  async getPetSyncStatus(petId: string): Promise<string> {
    try {
      const storage = await this.getStorageManager();
      const status = await storage.getSyncStatus(this.PETS_KEY);
      return status;
    } catch (err) {
      error('Failed to get pet sync status', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petId },
      });
      return 'error';
    }
  }

  async exportPets(): Promise<Pet[]> {
    try {
      const pets = await this.getAllPets();

      info('Pets exported', {
        context: { petCount: pets.length },
      });

      return pets;
    } catch (err) {
      error('Failed to export pets', {
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
      return [];
    }
  }

  async importPets(pets: Pet[]): Promise<void> {
    try {
      const storage = await this.getStorageManager();
      const existingPets = await this.getAllPets();

      // Merge imported pets with existing ones, avoiding duplicates
      const petMap = new Map(existingPets.map(pet => [pet.id, pet]));

      for (const importedPet of pets) {
        // Update timestamp to mark as imported
        const petToImport: Pet = {
          ...importedPet,
          updatedAt: new Date(),
        };
        petMap.set(importedPet.id, petToImport);
      }

      const mergedPets = Array.from(petMap.values());
      await storage.set(this.PETS_KEY, mergedPets);

      info('Pets imported successfully', {
        context: {
          importedCount: pets.length,
          totalCount: mergedPets.length,
        },
      });
    } catch (err) {
      error('Failed to import pets', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { importCount: pets.length },
      });
      throw err;
    }
  }

  /**
   * Normalizes pet data from storage by converting date strings to Date objects
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizePetData(pet: any): Pet {
    return {
      ...pet,
      createdAt: typeof pet.createdAt === 'string' ? new Date(pet.createdAt) : pet.createdAt,
      updatedAt: typeof pet.updatedAt === 'string' ? new Date(pet.updatedAt) : pet.updatedAt,
    };
  }

  private async cleanupRelatedData(petId: string): Promise<void> {
    try {
      const storage = await this.getStorageManager();

      // Clean up activities
      const activities = (await storage.get<Activity[]>('activities')) || [];
      const filteredActivities = activities.filter(activity => activity.petId !== petId);
      if (filteredActivities.length !== activities.length) {
        await storage.set('activities', filteredActivities);
      }

      // Clean up health records
      const healthRecords = (await storage.get<HealthRecord[]>('health_records')) || [];
      const filteredHealthRecords = healthRecords.filter(record => record.petId !== petId);
      if (filteredHealthRecords.length !== healthRecords.length) {
        await storage.set('health_records', filteredHealthRecords);
      }

      // Clean up food logs
      const foodLogs = (await storage.get<FoodLog[]>('food_logs')) || [];
      const filteredFoodLogs = foodLogs.filter(log => log.petId !== petId);
      if (filteredFoodLogs.length !== foodLogs.length) {
        await storage.set('food_logs', filteredFoodLogs);
      }

      // Clean up weight records
      const weightRecords = (await storage.get<WeightRecord[]>('weight_records')) || [];
      const filteredWeightRecords = weightRecords.filter(record => record.petId !== petId);
      if (filteredWeightRecords.length !== weightRecords.length) {
        await storage.set('weight_records', filteredWeightRecords);
      }

      debug('Related data cleanup completed', {
        context: {
          petId,
          activitiesRemoved: activities.length - filteredActivities.length,
          healthRecordsRemoved: healthRecords.length - filteredHealthRecords.length,
          foodLogsRemoved: foodLogs.length - filteredFoodLogs.length,
          weightRecordsRemoved: weightRecords.length - filteredWeightRecords.length,
        },
      });
    } catch (err) {
      warn('Failed to cleanup related data', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { petId },
      });
    }
  }
}
