# Offline Storage System

## Overview

The Pet Tracker app implements a comprehensive offline-first storage system that ensures data is always available locally while providing seamless cloud synchronization when possible. This system is designed to handle network interruptions gracefully and provide a smooth user experience regardless of connectivity.

## Architecture

### Core Components

1. **StorageManager**: Main orchestrator for all storage operations
2. **Local Storage Providers**: Handle local data persistence (AsyncStorage)
3. **Cloud Sync Providers**: Handle synchronization with remote services (GraphQL)
4. **Storage Services**: High-level APIs for specific data types (PetStorageService)
5. **Configuration System**: Environment-based configuration management

### Key Features

- **Offline-First**: All data is stored locally first, then synced to cloud
- **Automatic Fallback**: Falls back to local storage when offline
- **Configurable Sync**: Enable/disable cloud sync per environment
- **Event System**: Real-time notifications for storage operations
- **Batch Operations**: Efficient handling of multiple operations
- **Automatic Cleanup**: Manages storage size and old data removal

## Configuration

### Environment Variables

Add these to your `.env.*` files:

```bash
# Storage Configuration
EXPO_PUBLIC_ENABLE_LOCAL_STORAGE=true
EXPO_PUBLIC_ENABLE_CLOUD_SYNC=false
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://api.pettracker.app/graphql
EXPO_PUBLIC_STORAGE_KEY_PREFIX=pet_tracker
EXPO_PUBLIC_SYNC_INTERVAL_MINUTES=5
EXPO_PUBLIC_MAX_OFFLINE_DAYS=30
```

### Environment-Specific Settings

- **Development**: Local storage only, no cloud sync
- **Testing**: Local storage with minimal sync
- **Staging**: Full cloud sync for testing
- **Production**: Optimized sync with encryption

## Usage

### Basic Storage Operations

```typescript
import { StorageFactory } from '../storage';

// Initialize storage
const storage = await StorageFactory.createStorageManager();

// Store data
await storage.set('user_preferences', {
  theme: 'dark',
  notifications: true
});

// Retrieve data
const preferences = await storage.get('user_preferences');

// Remove data
await storage.remove('user_preferences');
```

### Pet-Specific Storage

```typescript
import { OfflinePetStorageService } from '../storage';

const petService = new OfflinePetStorageService();

// Add a pet
const newPet = await petService.addPet({
  name: 'Buddy',
  type: PetType.DOG,
  breed: 'Golden Retriever',
  ownerId: 'user_123'
});

// Get all pets
const pets = await petService.getAllPets('user_123');

// Update pet
await petService.updatePet(petId, { weight: 32 });

// Sync pets to cloud
await petService.syncPets();
```

### React Component Integration

```typescript
import React, { useEffect, useState } from 'react';
import { OfflinePetStorageService } from '../storage';

function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>('idle');
  
  const petService = useMemo(() => new OfflinePetStorageService(), []);

  useEffect(() => {
    const loadPets = async () => {
      const userPets = await petService.getAllPets();
      setPets(userPets);
    };
    loadPets();
  }, [petService]);

  const handleAddPet = async (petData: Omit<Pet, 'id'>) => {
    setSyncStatus('saving');
    const newPet = await petService.addPet(petData);
    setPets(prev => [...prev, newPet]);
    setSyncStatus('saved');
  };

  return (
    <View>
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
      <Text>Sync Status: {syncStatus}</Text>
    </View>
  );
}
```

## Data Flow

### Write Operations

1. **Immediate Local Save**: Data is saved to AsyncStorage immediately
2. **Event Notification**: Storage event is emitted to update UI
3. **Background Sync**: If cloud sync is enabled, data is queued for sync
4. **Sync Processing**: Background service syncs data when network is available
5. **Status Update**: Sync status is updated and events are emitted

### Read Operations

1. **Local First**: Data is always read from local storage first
2. **Cache Hit**: If data exists locally, return immediately
3. **Background Refresh**: Optionally fetch latest from cloud in background
4. **Merge Strategy**: Handle conflicts between local and cloud data

## Sync Strategies

### Conflict Resolution

The system uses a "last-write-wins" strategy with version numbers:

1. Each data item has a version number that increments on updates
2. When syncing, the item with the highest version wins
3. Conflicts are logged but resolved automatically
4. Manual conflict resolution can be implemented for critical data

### Network Handling

- **Online**: Immediate sync to cloud after local save
- **Offline**: Data queued for sync when connection returns
- **Poor Connection**: Exponential backoff for failed sync attempts
- **Sync Scheduling**: Background sync at configurable intervals

## Performance Optimization

### Batch Operations

```typescript
// Efficient batch insert
const items: Array<[string, any]> = [
  ['pet_1', petData1],
  ['pet_2', petData2],
  ['pet_3', petData3]
];
await storage.setMultiple(items);

// Efficient batch retrieve
const keys = ['pet_1', 'pet_2', 'pet_3'];
const results = await storage.getMultiple(keys);
```

### Memory Management

- Automatic cleanup of old data based on `MAX_OFFLINE_DAYS`
- Configurable storage limits
- Compression for large data items
- Lazy loading of non-critical data

### Background Processing

- Sync operations run in background to avoid blocking UI
- Queue management for pending sync items
- Automatic retry logic for failed operations
- Network-aware sync scheduling

## Error Handling

### Graceful Degradation

```typescript
const safeStorageOperation = async (key: string, data: any) => {
  try {
    await storage.set(key, data);
    return { success: true };
  } catch (error) {
    console.warn('Storage failed, using memory fallback');
    memoryCache.set(key, data);
    return { success: false, fallback: 'memory' };
  }
};
```

### Network Error Recovery

- Automatic detection of network connectivity changes
- Retry logic with exponential backoff
- User notifications for persistent sync failures
- Manual sync triggers for user control

## Security Considerations

### Data Protection

- **Encryption**: Optional encryption for sensitive data (production)
- **Key Management**: Secure storage of encryption keys
- **Access Control**: User-based data isolation
- **Audit Trail**: Logging of all data access and modifications

### Network Security

- **HTTPS Only**: All cloud communication uses HTTPS
- **Authentication**: JWT tokens for API access
- **Data Validation**: Input validation and sanitization
- **Rate Limiting**: Protection against abuse

## Monitoring and Analytics

### Storage Metrics

```typescript
const stats = await storage.getStats();
console.log({
  totalItems: stats.totalItems,
  pendingSync: stats.pendingSync,
  storageSize: stats.storageSize,
  syncErrors: stats.syncErrors
});
```

### Logging Integration

The storage system integrates with the app's logging system:

- **Operation Logging**: All storage operations are logged
- **Performance Metrics**: Timing information for operations
- **Error Tracking**: Detailed error information with context
- **Sync Statistics**: Success rates and failure patterns

## Testing

### Unit Testing

```typescript
describe('PetStorageService', () => {
  let storage: OfflinePetStorageService;

  beforeEach(async () => {
    // Use in-memory storage for tests
    await StorageFactory.createTestingStorage();
    storage = new OfflinePetStorageService();
  });

  it('should add and retrieve pets', async () => {
    const pet = await storage.addPet({
      name: 'Test Pet',
      type: PetType.DOG
    });
    
    const retrieved = await storage.getPet(pet.id);
    expect(retrieved).toEqual(pet);
  });
});
```

### Integration Testing

- End-to-end sync testing with mock GraphQL server
- Network interruption simulation
- Performance testing with large datasets
- Cross-platform compatibility testing

## Migration and Upgrades

### Data Migration

When updating data structures:

1. Version your data schemas
2. Implement migration functions
3. Run migrations on app startup
4. Maintain backward compatibility

### Storage Upgrades

- Gradual rollout of new storage features
- A/B testing of sync strategies
- Monitoring of migration success rates
- Rollback capabilities for failed migrations

## Troubleshooting

### Common Issues

1. **Storage Full**: Clear old data or increase limits
2. **Sync Failures**: Check network and endpoint configuration
3. **Data Corruption**: Implement data validation and repair
4. **Performance Issues**: Use batch operations and optimize queries

### Debug Tools

```typescript
// Enable debug logging
await StorageFactory.createStorageManager({
  enableLogging: true,
  logLevel: 'debug'
});

// Monitor storage events
storage.addEventListener((event) => {
  console.log('Storage event:', event);
});

// Get detailed statistics
const stats = await storage.getStats();
console.table(stats);
```

## Future Enhancements

- **Encrypted Storage**: Full data encryption at rest
- **Offline-First Queries**: Complex querying without cloud dependency
- **Peer-to-Peer Sync**: Direct device-to-device synchronization
- **Smart Sync**: AI-powered conflict resolution
- **Real-time Updates**: WebSocket-based live data updates

## Best Practices

1. **Always Store Locally First**: Never depend solely on cloud storage
2. **Handle Network Failures Gracefully**: Provide meaningful user feedback
3. **Use Appropriate Data Types**: Store structured data, not serialized strings
4. **Monitor Storage Usage**: Keep track of storage consumption
5. **Test Offline Scenarios**: Ensure app works without internet
6. **Implement Progressive Sync**: Sync most important data first
7. **Provide User Control**: Allow users to trigger manual syncs
8. **Log Everything**: Comprehensive logging helps with debugging
9. **Version Your Data**: Plan for future schema changes
10. **Validate Data**: Always validate data before storage and after retrieval
