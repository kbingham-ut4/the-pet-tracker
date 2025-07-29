import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatDateTime,
  calculateAge,
  getPetTypeDisplayName,
} from '../helpers';
import { PetType } from '../../types';

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate a unique string ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
      expect(id1.length).toEqual(36); // UUID v4 length
    });

    it('should generate IDs in UUID v4 format', () => {
      const id = generateId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate globally unique identifiers', () => {
      const ids = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(generateId());
      }

      expect(ids.size).toBe(count); // All should be unique
    });
  });

  describe('formatDate', () => {
    it('should format date in US locale format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(formatted).toBe('Jan 15, 2024');
    });

    it('should handle different dates correctly', () => {
      const testCases = [
        { date: new Date('2023-12-25'), expected: 'Dec 25, 2023' },
        { date: new Date('2024-06-01'), expected: 'Jun 1, 2024' },
        { date: new Date('2024-03-30'), expected: 'Mar 30, 2024' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(formatDate(date)).toBe(expected);
      });
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateTime(date);

      expect(formatted).toContain('Jan 15, 2024');
      expect(formatted).toContain('2:30 PM');
    });

    it('should handle AM/PM formatting', () => {
      const morningDate = new Date('2024-01-15T09:15:00');
      const eveningDate = new Date('2024-01-15T21:45:00');

      const morningFormatted = formatDateTime(morningDate);
      const eveningFormatted = formatDateTime(eveningDate);

      expect(morningFormatted).toContain('9:15 AM');
      expect(eveningFormatted).toContain('9:45 PM');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age in years for older pets', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const age = calculateAge(twoYearsAgo);
      expect(age).toBe('2 years old');
    });

    it('should handle singular year', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const age = calculateAge(oneYearAgo);
      expect(age).toBe('1 year old');
    });

    it('should calculate age in months for young pets', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const age = calculateAge(threeMonthsAgo);
      expect(age).toBe('3 months old');
    });

    it('should handle singular month', () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const age = calculateAge(oneMonthAgo);
      expect(age).toBe('1 month old');
    });

    it('should calculate age in days for very young pets', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const age = calculateAge(fiveDaysAgo);
      expect(age).toBe('5 days old');
    });
  });

  describe('getPetTypeDisplayName', () => {
    it('should return correct display names for all pet types', () => {
      const testCases = [
        { type: PetType.DOG, expected: 'Dog' },
        { type: PetType.CAT, expected: 'Cat' },
        { type: PetType.BIRD, expected: 'Bird' },
        { type: PetType.FISH, expected: 'Fish' },
        { type: PetType.RABBIT, expected: 'Rabbit' },
        { type: PetType.HAMSTER, expected: 'Hamster' },
        { type: PetType.REPTILE, expected: 'Reptile' },
        { type: PetType.OTHER, expected: 'Other' },
      ];

      testCases.forEach(({ type, expected }) => {
        expect(getPetTypeDisplayName(type)).toBe(expected);
      });
    });
  });
});
