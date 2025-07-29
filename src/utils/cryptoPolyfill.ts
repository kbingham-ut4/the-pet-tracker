/**
 * Polyfill for crypto.getRandomValues in environments where it's not available
 * Used to ensure UUID generation works across all environments
 *
 * This implementation provides a fallback for React Native environments
 * Note: Test environment is handled separately in src/test/mockCrypto.ts
 */

// Check if we're in a test environment
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;

// Skip this implementation in test environments - tests have their own mock
if (!isTest) {
  try {
    // Dynamic imports to avoid issues in test environment
    const Platform = require('react-native').Platform;
    const ExpoCrypto = require('expo-crypto');

    // Simple logging to avoid circular dependencies
    const log = (
      level: 'log' | 'info' | 'warn' | 'error',
      message: string,
      context?: Record<string, unknown>
    ) => {
      try {
        if (level === 'info') {
          // Only use warn and error as per linting rules
          console.warn(`[INFO] ${message}`, context);
        } else if (level === 'warn') {
          console.warn(message, context);
        } else if (level === 'error') {
          console.error(message, context);
        } else {
          // Default to warn for any other log levels
          console.warn(`[LOG] ${message}`, context);
        }
      } catch {
        // If something goes wrong, use warn as fallback
        console.warn(`${level}: ${message}`, context);
      }
    };

    // Check if crypto is already available globally
    if (typeof global.crypto !== 'object') {
      global.crypto = {} as Crypto;
    }

    if (typeof global.crypto.getRandomValues !== 'function') {
      try {
        // Use Expo's crypto implementation which works on all platforms
        global.crypto.getRandomValues = (<T extends ArrayBufferView | null>(array: T): T => {
          if (array === null) {
            return array;
          }
          if (!(array instanceof Uint8Array)) {
            throw new Error('Only Uint8Array is supported for crypto.getRandomValues polyfill');
          }

          const randomBytes = ExpoCrypto.getRandomBytes(array.length);
          for (let i = 0; i < array.length; i++) {
            array[i] = randomBytes[i];
          }
          return array;
        }) as Crypto['getRandomValues'];

        log('info', 'Crypto polyfill installed using expo-crypto', {
          platform: Platform.OS,
        });
      } catch (error) {
        // Fallback for environments where expo-crypto might not be available
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

        log('warn', 'Using Math.random fallback for crypto.getRandomValues', {
          errorMessage: (error as Error)?.message,
        });
      }
    }
  } catch {
    // If we can't even import React Native, we're likely in a non-RN environment
    console.warn('Failed to initialize crypto polyfill, likely not in a React Native environment');
  }
}
