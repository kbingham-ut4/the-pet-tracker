import { PetType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

// Ensure crypto is available for UUID generation
if (typeof global.crypto !== 'object') {
  global.crypto = {} as Crypto;
}

if (typeof global.crypto.getRandomValues !== 'function') {
  // Simple fallback that works everywhere
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
}

// In real app, use the full implementation if it's not a test
if (!process.env.NODE_ENV && !process.env.VITEST) {
  try {
    require('./cryptoPolyfill');
  } catch {
    // Already using the fallback, so we can ignore this
  }
}

/**
 * Generates a globally unique identifier (UUID v4)
 * Uses the uuid package with crypto polyfill to ensure compatibility across all environments
 * Fallbacks to timestamp-based ID if UUID generation fails
 *
 * @returns A UUID v4 string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateId(): string {
  try {
    return uuidv4();
  } catch (error) {
    // Log the error
    logger.error('UUID generation failed, using fallback', {
      error,
      context: { fallbackMethod: 'timestamp' },
    });

    // Fallback to timestamp-based ID with some randomness
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}-${random}`;
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateAge(birthDate: Date): string {
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();

  if (years > 0) {
    return years === 1 ? '1 year old' : `${years} years old`;
  } else if (months > 0) {
    return months === 1 ? '1 month old' : `${months} months old`;
  } else {
    const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return days === 1 ? '1 day old' : `${days} days old`;
  }
}

export function getPetTypeDisplayName(type: PetType): string {
  switch (type) {
    case PetType.DOG:
      return 'Dog';
    case PetType.CAT:
      return 'Cat';
    case PetType.BIRD:
      return 'Bird';
    case PetType.FISH:
      return 'Fish';
    case PetType.RABBIT:
      return 'Rabbit';
    case PetType.HAMSTER:
      return 'Hamster';
    case PetType.REPTILE:
      return 'Reptile';
    case PetType.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
