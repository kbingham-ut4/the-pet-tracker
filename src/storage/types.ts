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
    initialize(config?: any): Promise<void>;
    uploadItem<T>(key: string, item: StorageItem<T>): Promise<void>;
    downloadItem<T>(key: string): Promise<StorageItem<T> | null>;
    deleteItem(key: string): Promise<void>;
    syncItems(keys: string[]): Promise<SyncResult>;
    isOnline(): Promise<boolean>;
}

export interface LocalStorageProvider {
    name: string;
    initialize(keyPrefix?: string): Promise<void>;
    setItem<T>(key: string, item: StorageItem<T>): Promise<void>;
    getItem<T>(key: string): Promise<StorageItem<T> | null>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    multiGet<T>(keys: string[]): Promise<Array<[string, StorageItem<T> | null]>>;
    multiSet<T>(keyValuePairs: Array<[string, StorageItem<T>]>): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
    clear(): Promise<void>;
}

export interface StorageEventData {
    key: string;
    action: 'set' | 'remove' | 'sync' | 'error';
    data?: any;
    error?: string;
}

export type StorageEventListener = (event: StorageEventData) => void;

export interface OfflineStorageManager {
    // Configuration
    initialize(config: StorageConfig): Promise<void>;
    getConfig(): StorageConfig;

    // Basic operations
    set<T>(key: string, data: T, userId?: string): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    remove(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;

    // Batch operations
    getMultiple<T>(keys: string[]): Promise<Array<[string, T | null]>>;
    setMultiple<T>(items: Array<[string, T]>, userId?: string): Promise<void>;
    removeMultiple(keys: string[]): Promise<void>;

    // Query operations
    query<T>(query: StorageQuery): Promise<Array<[string, T]>>;
    getAll<T>(keyPrefix?: string): Promise<Array<[string, T]>>;

    // Sync operations
    sync(): Promise<SyncResult>;
    syncItem(key: string): Promise<boolean>;
    getSyncStatus(key: string): Promise<SyncStatus>;

    // Event handling
    addEventListener(listener: StorageEventListener): void;
    removeEventListener(listener: StorageEventListener): void;

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
