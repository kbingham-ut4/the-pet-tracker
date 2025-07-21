import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GraphQLSyncProvider } from '../GraphQLSyncProvider';
import NetInfo from '@react-native-community/netinfo';
import type { StorageItem } from '../../types';

// Mock dependencies
vi.mock('@react-native-community/netinfo', () => ({
    default: {
        fetch: vi.fn(),
    },
}));

vi.mock('../../../utils/logging', () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GraphQLSyncProvider', () => {
    let provider: GraphQLSyncProvider;
    let mockStorageItem: StorageItem<any>;

    beforeEach(() => {
        provider = new GraphQLSyncProvider();
        mockFetch.mockClear();

        // Setup NetInfo mock with online state by default
        vi.mocked(NetInfo.fetch).mockResolvedValue({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
        } as any);

        mockStorageItem = {
            data: { name: 'Test Pet', species: 'Dog' },
            metadata: {
                id: 'test-id',
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                version: 1,
                syncStatus: 'pending',
                userId: 'user-1',
                deviceId: 'device-1',
            },
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with endpoint', async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
            });

            expect(provider.name).toBe('graphql');
        });

        it('should initialize with endpoint and headers', async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
                headers: { 'Authorization': 'Bearer test-token' },
            });

            expect(provider.name).toBe('graphql');
        });

        it('should throw error without endpoint', async () => {
            await expect(provider.initialize())
                .rejects.toThrow('GraphQL endpoint is required for initialization');
        });

        it('should not reinitialize if already initialized', async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
            });

            // Second call should not throw
            await provider.initialize({
                endpoint: 'https://different.com/graphql',
            });

            expect(provider.name).toBe('graphql');
        });
    });

    describe('connectivity', () => {
        beforeEach(async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
                headers: { 'Authorization': 'Bearer test-token' },
            });
        });

        it('should check online status', async () => {
            const isOnline = await provider.isOnline();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(isOnline).toBe(true);
        });

        it('should handle offline state', async () => {
            vi.mocked(NetInfo.fetch).mockResolvedValue({
                isConnected: false,
                isInternetReachable: false,
            } as any);

            const isOnline = await provider.isOnline();

            expect(isOnline).toBe(false);
        });

        it('should handle connectivity check errors', async () => {
            vi.mocked(NetInfo.fetch).mockRejectedValueOnce(new Error('NetInfo error'));

            const isOnline = await provider.isOnline();

            expect(isOnline).toBe(false);
        });
    });

    describe('upload operations', () => {
        beforeEach(async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
                headers: { 'Authorization': 'Bearer test-token' },
            });
        });

        describe('uploadItem', () => {
            it('should upload item successfully', async () => {
                const serverResponse = {
                    data: {
                        upsertItem: {
                            success: true,
                            id: 'test-id',
                            version: 2
                        }
                    }
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue(serverResponse),
                } as any);

                await provider.uploadItem('test-key', mockStorageItem);

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://api.example.com/graphql',
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer test-token',
                        }),
                        body: expect.stringContaining('upsertItem'),
                    })
                );
            });

            it('should handle GraphQL errors', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        errors: [{ message: 'GraphQL validation error' }]
                    }),
                } as any);

                await expect(provider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('GraphQL validation error');
            });

            it('should handle network errors', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Network error'));

                await expect(provider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('Network error');
            });

            it('should handle HTTP errors', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                } as any);

                await expect(provider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('HTTP 500: Internal Server Error');
            });

            it('should handle unsuccessful upload', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            upsertItem: {
                                success: false
                            }
                        }
                    }),
                } as any);

                await expect(provider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('Upload failed: Invalid response');
            });

            it('should require initialization', async () => {
                const uninitializedProvider = new GraphQLSyncProvider();

                await expect(uninitializedProvider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('GraphQLSyncProvider not initialized');
            });

            it('should check connectivity before upload', async () => {
                vi.mocked(NetInfo.fetch).mockResolvedValue({
                    isConnected: false,
                    isInternetReachable: false,
                } as any);

                await expect(provider.uploadItem('test-key', mockStorageItem))
                    .rejects.toThrow('No internet connection available');
            });
        });

        describe('downloadItem', () => {
            it('should download item successfully', async () => {
                const serverItem = {
                    data: mockStorageItem.data,
                    metadata: {
                        ...mockStorageItem.metadata,
                        createdAt: mockStorageItem.metadata.createdAt.toISOString(),
                        updatedAt: mockStorageItem.metadata.updatedAt.toISOString(),
                        lastSyncAt: undefined,
                        version: 2
                    }
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            getItem: serverItem
                        }
                    }),
                } as any);

                const result = await provider.downloadItem('test-key');

                expect(result).toBeDefined();
                expect(result?.data).toEqual(mockStorageItem.data);
                expect(result?.metadata.version).toBe(2);
                expect(mockFetch).toHaveBeenCalledWith(
                    'https://api.example.com/graphql',
                    expect.objectContaining({
                        method: 'POST',
                        body: expect.stringContaining('getItem'),
                    })
                );
            });

            it('should return null for non-existent item', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            getItem: null
                        }
                    }),
                } as any);

                const result = await provider.downloadItem('non-existent');

                expect(result).toBeNull();
            });

            it('should handle download errors', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Download error'));

                await expect(provider.downloadItem('test-key'))
                    .rejects.toThrow('Download error');
            });

            it('should convert date strings to Date objects', async () => {
                const serverItem = {
                    data: mockStorageItem.data,
                    metadata: {
                        ...mockStorageItem.metadata,
                        createdAt: '2023-01-01T00:00:00.000Z',
                        updatedAt: '2023-01-02T00:00:00.000Z',
                        lastSyncAt: '2023-01-03T00:00:00.000Z',
                        version: 2
                    }
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            getItem: serverItem
                        }
                    }),
                } as any);

                const result = await provider.downloadItem('test-key');

                expect(result?.metadata.createdAt).toBeInstanceOf(Date);
                expect(result?.metadata.updatedAt).toBeInstanceOf(Date);
                expect(result?.metadata.lastSyncAt).toBeInstanceOf(Date);
            });
        });

        describe('deleteItem', () => {
            it('should delete item successfully', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            deleteItem: {
                                success: true
                            }
                        }
                    }),
                } as any);

                await provider.deleteItem('test-key');

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://api.example.com/graphql',
                    expect.objectContaining({
                        method: 'POST',
                        body: expect.stringContaining('deleteItem'),
                    })
                );
            });

            it('should handle delete failures', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: {
                            deleteItem: {
                                success: false
                            }
                        }
                    }),
                } as any);

                await expect(provider.deleteItem('test-key'))
                    .rejects.toThrow('Delete failed: Invalid response');
            });

            it('should handle delete errors', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Delete error'));

                await expect(provider.deleteItem('test-key'))
                    .rejects.toThrow('Delete error');
            });
        });

        describe('syncItems', () => {
            it('should sync multiple items successfully', async () => {
                const keys = ['key1', 'key2'];

                // Mock successful download responses for all items
                mockFetch
                    .mockResolvedValueOnce({
                        ok: true,
                        json: vi.fn().mockResolvedValue({
                            data: {
                                getItem: {
                                    data: mockStorageItem.data,
                                    metadata: {
                                        ...mockStorageItem.metadata,
                                        createdAt: mockStorageItem.metadata.createdAt.toISOString(),
                                        updatedAt: mockStorageItem.metadata.updatedAt.toISOString(),
                                        lastSyncAt: undefined
                                    }
                                }
                            }
                        }),
                    } as any)
                    .mockResolvedValueOnce({
                        ok: true,
                        json: vi.fn().mockResolvedValue({
                            data: {
                                getItem: {
                                    data: mockStorageItem.data,
                                    metadata: {
                                        ...mockStorageItem.metadata,
                                        createdAt: mockStorageItem.metadata.createdAt.toISOString(),
                                        updatedAt: mockStorageItem.metadata.updatedAt.toISOString(),
                                        lastSyncAt: undefined
                                    }
                                }
                            }
                        }),
                    } as any);

                const result = await provider.syncItems(keys);

                expect(result.success).toBe(true);
                expect(result.itemsProcessed).toBe(2);
                expect(result.itemsSynced).toBe(2);
                expect(result.errors).toHaveLength(0);
            });

            it('should handle partial failures', async () => {
                const keys = ['key1', 'key2'];

                // First item succeeds, second fails
                mockFetch
                    .mockResolvedValueOnce({
                        ok: true,
                        json: vi.fn().mockResolvedValue({
                            data: {
                                getItem: {
                                    data: mockStorageItem.data,
                                    metadata: {
                                        ...mockStorageItem.metadata,
                                        createdAt: mockStorageItem.metadata.createdAt.toISOString(),
                                        updatedAt: mockStorageItem.metadata.updatedAt.toISOString(),
                                        lastSyncAt: undefined
                                    }
                                }
                            }
                        }),
                    } as any)
                    .mockRejectedValueOnce(new Error('Network error'));

                const result = await provider.syncItems(keys);

                expect(result.success).toBe(false);
                expect(result.itemsProcessed).toBe(2);
                expect(result.itemsSynced).toBe(1);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0].error).toContain('Network error');
            });

            it('should handle offline state', async () => {
                // Mock offline state
                vi.mocked(NetInfo.fetch).mockResolvedValue({
                    isConnected: false,
                    isInternetReachable: false,
                } as any);

                const result = await provider.syncItems(['key1']);

                expect(result.success).toBe(false);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0].error).toContain('No internet connection');
            });

            it('should handle empty keys array', async () => {
                const result = await provider.syncItems([]);

                expect(result.success).toBe(true);
                expect(result.itemsProcessed).toBe(0);
                expect(result.itemsSynced).toBe(0);
                expect(result.errors).toHaveLength(0);
            });

            it('should handle items not found on server', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                        data: { getItem: null }
                    }),
                } as any);

                const result = await provider.syncItems(['non-existent-key']);

                expect(result.success).toBe(true);
                expect(result.itemsProcessed).toBe(1);
                expect(result.itemsSynced).toBe(0); // Item not found, so not synced
                expect(result.errors).toHaveLength(0);
            });
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            await provider.initialize({
                endpoint: 'https://api.example.com/graphql',
                headers: { 'Authorization': 'Bearer test-token' },
            });
        });

        it('should handle malformed JSON responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
            } as any);

            await expect(provider.uploadItem('test-key', mockStorageItem))
                .rejects.toThrow('Invalid JSON');
        });

        it('should require initialization before operations', async () => {
            const uninitializedProvider = new GraphQLSyncProvider();

            await expect(uninitializedProvider.downloadItem('test-key'))
                .rejects.toThrow('GraphQLSyncProvider not initialized');

            await expect(uninitializedProvider.deleteItem('test-key'))
                .rejects.toThrow('GraphQLSyncProvider not initialized');

            // syncItems doesn't throw, but returns errors in the result
            const result = await uninitializedProvider.syncItems(['test-key']);
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('GraphQLSyncProvider not initialized');
        });
    });
});
