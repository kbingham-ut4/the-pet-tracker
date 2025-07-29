/**
 * Test-specific implementation of the crypto polyfill
 * This is a simplified version that works in the test environment
 * without relying on React Native or Expo APIs
 */

// Simple mock implementation for tests
if (typeof global.crypto !== 'object') {
  global.crypto = {} as Crypto;
}

if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = (<T extends ArrayBufferView | null>(array: T): T => {
    if (array === null) {
      return array;
    }
    if (array instanceof Uint8Array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }) as Crypto['getRandomValues'];

  console.warn('[Test Environment] Using Math.random fallback for crypto.getRandomValues');
}

export default {};
