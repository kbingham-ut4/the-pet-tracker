/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Storage System Types and Interfaces
 *
 * This module defines the types used throughout the offline-first storage system
 */

export type StorageProvider = 'async-storage' | 'memory';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error' | 'conflict';

export interface StorageMetadata {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  version: number;
  lastSyncAt?: Date;
  syncError?: string;
  userId?: string;
  deviceId?: string;
}

export interface StorageItem<T = any> {
  data: T;
  metadata: StorageMetadata;
}

export interface StorageQuery {
  key?: string;
  keyPrefix?: string;
  syncStatus?: SyncStatus;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface StorageConfig {
  enableLocalStorage: boolean;
  enableCloudSync: boolean;
  storageProvider: StorageProvider;
  keyPrefix: string;
  syncIntervalMinutes: number;
  maxOfflineDays: number;
  graphqlEndpoint?: string;
  enableEncryption?: boolean;
  compressionEnabled?: boolean;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsSynced: number;
  itemsConflicted: number;
  errors: SyncError[];
}

export interface SyncError {
  key: string;
  error: string;
  timestamp: Date;
}

export interface CloudSyncProvider {
  name: string;
  initialize(_config?: any): Promise<void>;
  uploadItem<T>(_key: string, _item: StorageItem<T>): Promise<void>;
  downloadItem<T>(_key: string): Promise<StorageItem<T> | null>;
  deleteItem(_key: string): Promise<void>;
  syncItems(_keys: string[]): Promise<SyncResult>;
  isOnline(): Promise<boolean>;
}

export interface LocalStorageProvider {
  name: string;
  initialize(_keyPrefix?: string): Promise<void>;
  setItem<T>(_key: string, _item: StorageItem<T>): Promise<void>;
  getItem<T>(_key: string): Promise<StorageItem<T> | null>;
  removeItem(_key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet<T>(_keys: string[]): Promise<Array<[string, StorageItem<T> | null]>>;
  multiSet<T>(_keyValuePairs: Array<[string, StorageItem<T>]>): Promise<void>;
  multiRemove(_keys: string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface StorageEventData {
  key: string;
  action: 'set' | 'remove' | 'sync' | 'error';
  data?: any;
  error?: string;
}

export type StorageEventListener = (_event: StorageEventData) => void;

export interface OfflineStorageManager {
  // Configuration
  initialize(_config: StorageConfig): Promise<void>;
  getConfig(): StorageConfig;

  // Basic operations
  set<T>(_key: string, _data: T, _userId?: string): Promise<void>;
  get<T>(_key: string): Promise<T | null>;
  remove(_key: string): Promise<void>;
  exists(_key: string): Promise<boolean>;

  // Batch operations
  getMultiple<T>(_keys: string[]): Promise<Array<[string, T | null]>>;
  setMultiple<T>(_items: Array<[string, T]>, _userId?: string): Promise<void>;
  removeMultiple(_keys: string[]): Promise<void>;

  // Query operations
  query<T>(_query: StorageQuery): Promise<Array<[string, T]>>;
  getAll<T>(_keyPrefix?: string): Promise<Array<[string, T]>>;

  // Sync operations
  sync(): Promise<SyncResult>;
  syncItem(_key: string): Promise<boolean>;
  getSyncStatus(_key: string): Promise<SyncStatus>;

  // Event handling
  addEventListener(_listener: StorageEventListener): void;
  removeEventListener(_listener: StorageEventListener): void;

  // Maintenance
  cleanup(): Promise<void>;
  getStats(): Promise<StorageStats>;
  clear(): Promise<void>;
}

export interface StorageStats {
  totalItems: number;
  pendingSync: number;
  syncErrors: number;
  lastSyncAt?: Date;
  storageSize: number; // in bytes
  oldestItem?: Date;
  newestItem?: Date;
}

// Pet-specific storage types
export interface PetStorageData {
  pets: any[];
  activities: any[];
  healthRecords: any[];
  foodLogs: any[];
  weightRecords: any[];
}

export type PetStorageKey = keyof PetStorageData;
