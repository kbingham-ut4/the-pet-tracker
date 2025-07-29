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

/**
 * Formats a date to dd-mm-yyyy format for display
 * @param date - The date to format
 * @returns Date string in dd-mm-yyyy format
 */
export function formatDateDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Parses a dd-mm-yyyy date string to a Date object
 * @param dateString - Date string in dd-mm-yyyy format
 * @returns Date object or null if invalid
 */
export function parseDateDDMMYYYY(dateString: string): Date | null {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  const date = new Date(year, month, day);

  // Validate that the date is correct (handles invalid dates like 31/02/2023)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }

  return date;
}

/**
 * Formats a date to yyyy-mm-dd format for storage
 * @param date - The date to format
 * @returns Date string in yyyy-mm-dd format
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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

/**
 * Calculates the numeric age in years from a date of birth
 * Used for calculations like calorie requirements
 *
 * @param dateOfBirth - The pet's date of birth
 * @returns The age in years as a number, or undefined if no date provided
 */
export function calculateAgeInYears(dateOfBirth: Date | undefined): number | undefined {
  if (!dateOfBirth) {
    return undefined;
  }

  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1;
  }

  return age;
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
