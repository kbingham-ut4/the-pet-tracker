---
title: ID Management
description: Guidelines for generating and handling unique identifiers in Pet Tracker
---

# ID Management

## Overview

Pet Tracker uses UUID v4 (Universally Unique Identifier) for all entity identifiers across the application. This document outlines the approach, benefits, and implementation details.

## Implementation

### UUID v4

We use the `uuid` package (version 11.1.0 or later) to generate UUID v4 identifiers. UUIDs are 128-bit values that are globally unique with extremely high probability, making them ideal for distributed systems without central coordination.

```typescript
import { v4 as uuidv4 } from 'uuid';
// Import crypto polyfill to ensure cross-platform compatibility
import './cryptoPolyfill';

// Implementation in our utils/helpers.ts
export function generateId(): string {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback to timestamp-based ID with randomness if UUID fails
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}-${random}`;
  }
}
```

### Crypto Polyfill

To ensure UUID generation works across all platforms (including React Native), we implement a crypto polyfill that provides the `crypto.getRandomValues()` API using Expo's secure random number generator:

```typescript
// src/utils/cryptoPolyfill.ts
import { Platform } from 'react-native';
import * as ExpoCrypto from 'expo-crypto';

// Check if crypto is already available globally
if (typeof global.crypto !== 'object') {
  global.crypto = {} as Crypto;
}

if (typeof global.crypto.getRandomValues !== 'function') {
  // Use Expo's crypto implementation
  global.crypto.getRandomValues = array => {
    const randomBytes = ExpoCrypto.getRandomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = randomBytes[i];
    }
    return array;
  };
}
```

### Usage

Always use the `generateId()` helper function from the utils module rather than directly calling UUID functions or implementing custom ID generation:

```typescript
import { generateId } from '@/utils';

const newPet = {
  id: generateId(),
  name: 'Fluffy',
  // other properties
};
```

## Benefits

1. **Global Uniqueness**: Virtually guaranteed unique even across distributed systems
2. **Security**: Cryptographically secure and unpredictable (unlike sequential or timestamp-based IDs)
3. **No Coordination Required**: Can generate IDs offline without central service
4. **No Collisions**: Unlike timestamp-based IDs, UUIDs won't collide during high-frequency operations
5. **Privacy**: Does not leak information about creation time or sequence (unlike timestamp IDs)

## Performance Considerations

While UUIDs are slightly larger than numeric IDs (36 characters vs typically 1-10 for numeric IDs), the benefits in terms of uniqueness, security, and distributed operation outweigh the minor storage increase.

For high-performance operations where many UUIDs need to be generated quickly, consider:

1. **Batched Generation**: Generate UUIDs in advance for predictable batch operations
2. **Caching**: Store commonly used UUIDs when appropriate
3. **Index Planning**: Ensure proper database indexing for UUID fields

## Storage Format

UUIDs are stored as standard string format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (36 characters including hyphens).

## Testing

When testing ID generation:

```typescript
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

// Test UUID validity and version
const id = generateId();
expect(uuidValidate(id)).toBe(true);
expect(uuidVersion(id)).toBe(4);
```

## Related Topics

- [Storage System](/development/storage) - Learn how UUIDs are used in our storage layer
- [API Reference](/api) - Reference for ID-related utility functions
