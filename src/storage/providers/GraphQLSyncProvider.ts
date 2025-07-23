/**
 * GraphQL Cloud Sync Provider
 *
 * Handles synchronization with cloud storage via GraphQL endpoints
 */

import NetInfo from '@react-native-community/netinfo';
import { CloudSyncProvider, StorageItem, SyncResult, SyncError } from '../types';
import { info, warn, error, debug } from '../../utils/logging';

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

interface GraphQLMutation {
  upsertItem: {
    success: boolean;
    id: string;
    version: number;
  };
}

interface GraphQLDelete {
  deleteItem: {
    success: boolean;
  };
}

interface GraphQLQuery<T = unknown> {
  getItem: StorageItem<T> | null;
  getItems: StorageItem<T>[];
}

export class GraphQLSyncProvider implements CloudSyncProvider {
  name = 'graphql';
  private endpoint: string = '';
  private headers: Record<string, string> = {};
  private initialized = false;

  async initialize(config?: { endpoint: string; headers?: Record<string, string> }): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!config?.endpoint) {
      throw new Error('GraphQL endpoint is required for initialization');
    }

    this.endpoint = config.endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.initialized = true;

    info('GraphQL sync provider initialized', {
      context: { endpoint: this.endpoint },
    });
  }

  async isOnline(): Promise<boolean> {
    try {
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected && netState.isInternetReachable;

      debug('Network connectivity check', {
        context: {
          isConnected: netState.isConnected,
          isInternetReachable: netState.isInternetReachable,
          connectionType: netState.type,
        },
      });

      return !!isConnected;
    } catch (err) {
      warn('Failed to check network connectivity', {
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
      return false;
    }
  }

  private async makeGraphQLRequest<T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<GraphQLResponse<T>> {
    if (!this.initialized) {
      throw new Error('GraphQLSyncProvider not initialized');
    }

    if (!(await this.isOnline())) {
      throw new Error('No internet connection available');
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result;
    } catch (err) {
      error('GraphQL request failed', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { endpoint: this.endpoint },
      });
      throw err;
    }
  }

  async uploadItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    const mutation = `
      mutation UpsertStorageItem($key: String!, $data: JSON!, $metadata: StorageMetadataInput!) {
        upsertItem(key: $key, data: $data, metadata: $metadata) {
          success
          id
          version
        }
      }
    `;

    const variables = {
      key,
      data: item.data,
      metadata: {
        id: item.metadata.id,
        createdAt: item.metadata.createdAt.toISOString(),
        updatedAt: item.metadata.updatedAt.toISOString(),
        version: item.metadata.version,
        userId: item.metadata.userId,
        deviceId: item.metadata.deviceId,
      },
    };

    try {
      const response = await this.makeGraphQLRequest<GraphQLMutation>(mutation, variables);

      if (response.data?.upsertItem?.success) {
        info('Item uploaded to cloud', {
          context: {
            key,
            version: response.data.upsertItem.version,
            id: response.data.upsertItem.id,
          },
        });
      } else {
        throw new Error('Upload failed: Invalid response');
      }
    } catch (err) {
      error('Failed to upload item to cloud', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key },
      });
      throw err;
    }
  }

  async downloadItem<T>(key: string): Promise<StorageItem<T> | null> {
    const query = `
      query GetStorageItem($key: String!) {
        getItem(key: $key) {
          data
          metadata {
            id
            createdAt
            updatedAt
            syncStatus
            version
            lastSyncAt
            userId
            deviceId
          }
        }
      }
    `;

    const variables = { key };

    try {
      const response = await this.makeGraphQLRequest<GraphQLQuery<T>>(query, variables);

      if (!response.data?.getItem) {
        debug('Item not found in cloud', { context: { key } });
        return null;
      }

      const cloudItem = response.data.getItem;

      // Convert date strings back to Date objects
      const item: StorageItem<T> = {
        data: cloudItem.data,
        metadata: {
          ...cloudItem.metadata,
          createdAt: new Date(cloudItem.metadata.createdAt),
          updatedAt: new Date(cloudItem.metadata.updatedAt),
          lastSyncAt: cloudItem.metadata.lastSyncAt
            ? new Date(cloudItem.metadata.lastSyncAt)
            : undefined,
        },
      };

      info('Item downloaded from cloud', {
        context: { key, version: item.metadata.version },
      });

      return item;
    } catch (err) {
      error('Failed to download item from cloud', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key },
      });
      throw err;
    }
  }

  async deleteItem(key: string): Promise<void> {
    const mutation = `
      mutation DeleteStorageItem($key: String!) {
        deleteItem(key: $key) {
          success
        }
      }
    `;

    const variables = { key };

    try {
      const response = await this.makeGraphQLRequest<GraphQLDelete>(mutation, variables);

      if (response.data?.deleteItem?.success) {
        info('Item deleted from cloud', { context: { key } });
      } else {
        throw new Error('Delete failed: Invalid response');
      }
    } catch (err) {
      error('Failed to delete item from cloud', {
        error: err instanceof Error ? err : new Error('Unknown error'),
        context: { key },
      });
      throw err;
    }
  }

  async syncItems(keys: string[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      itemsProcessed: 0,
      itemsSynced: 0,
      itemsConflicted: 0,
      errors: [],
    };

    if (!(await this.isOnline())) {
      result.success = false;
      result.errors.push({
        key: 'network',
        error: 'No internet connection available',
        timestamp: new Date(),
      });
      return result;
    }

    info('Starting batch sync', { context: { itemCount: keys.length } });

    for (const key of keys) {
      try {
        result.itemsProcessed++;

        // For now, we'll implement a simple sync strategy
        // In a real implementation, you'd want to compare versions
        // and handle conflicts appropriately

        const cloudItem = await this.downloadItem(key);
        if (cloudItem) {
          result.itemsSynced++;
        }
      } catch (err) {
        const syncError: SyncError = {
          key,
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date(),
        };

        result.errors.push(syncError);
        result.success = false;
      }
    }

    info('Batch sync completed', {
      context: {
        itemsProcessed: result.itemsProcessed,
        itemsSynced: result.itemsSynced,
        itemsConflicted: result.itemsConflicted,
        errorCount: result.errors.length,
      },
    });

    return result;
  }
}
