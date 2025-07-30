import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatDateTime,
  formatDateDDMMYYYY,
  formatDateYYYYMMDD,
  parseDateDDMMYYYY,
  calculateAge,
  calculateAgeInYears,
  calculateDetailedAge,
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

  describe('formatDateDDMMYYYY', () => {
    it('should format date in dd-mm-yyyy format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateDDMMYYYY(date);
      expect(formatted).toBe('15-01-2024');
    });

    it('should pad single digits with zeros', () => {
      const date = new Date('2024-03-05');
      const formatted = formatDateDDMMYYYY(date);
      expect(formatted).toBe('05-03-2024');
    });
  });

  describe('formatDateYYYYMMDD', () => {
    it('should format date in yyyy-mm-dd format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateYYYYMMDD(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should pad single digits with zeros', () => {
      const date = new Date('2024-03-05');
      const formatted = formatDateYYYYMMDD(date);
      expect(formatted).toBe('2024-03-05');
    });
  });

  describe('parseDateDDMMYYYY', () => {
    it('should parse valid dd-mm-yyyy date string', () => {
      const dateString = '15-01-2024';
      const date = parseDateDDMMYYYY(dateString);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getDate()).toBe(15);
      expect(date?.getMonth()).toBe(0); // January is 0
      expect(date?.getFullYear()).toBe(2024);
    });

    it('should return null for invalid date string', () => {
      expect(parseDateDDMMYYYY('invalid')).toBeNull();
      expect(parseDateDDMMYYYY('32-01-2024')).toBeNull(); // Invalid day
      expect(parseDateDDMMYYYY('15-13-2024')).toBeNull(); // Invalid month
      expect(parseDateDDMMYYYY('29-02-2023')).toBeNull(); // Invalid leap year date
    });

    it('should return null for empty or malformed strings', () => {
      expect(parseDateDDMMYYYY('')).toBeNull();
      expect(parseDateDDMMYYYY('15-01')).toBeNull();
      expect(parseDateDDMMYYYY('15/01/2024')).toBeNull();
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

  describe('calculateAgeInYears', () => {
    it('should return undefined for undefined input', () => {
      const age = calculateAgeInYears(undefined);
      expect(age).toBeUndefined();
    });

    it('should calculate correct age in years for adult pet', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      const age = calculateAgeInYears(threeYearsAgo);
      expect(age).toBe(3);
    });

    it('should handle birthday not yet occurred this year', () => {
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 2);
      dateOfBirth.setMonth(11); // December
      dateOfBirth.setDate(25); // Christmas

      // If current date is before the birthday this year, age should be 1 less
      const currentDate = new Date();
      if (
        currentDate.getMonth() < 11 ||
        (currentDate.getMonth() === 11 && currentDate.getDate() < 25)
      ) {
        const age = calculateAgeInYears(dateOfBirth);
        expect(age).toBe(1); // Birthday hasn't occurred yet this year
      } else {
        const age = calculateAgeInYears(dateOfBirth);
        expect(age).toBe(2); // Birthday has occurred this year
      }
    });

    it('should handle newborn pets (less than 1 year)', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const age = calculateAgeInYears(twoMonthsAgo);
      expect(age).toBe(0);
    });
  });

  describe('calculateDetailedAge', () => {
    it('should return undefined for undefined input', () => {
      const age = calculateDetailedAge(undefined);
      expect(age).toBeUndefined();
    });

    it('should calculate correct age for newborn (Arthur example)', () => {
      // Arthur born March 8, 2025, testing on July 30, 2025
      const arthurBirthday = new Date('2025-03-08T00:00:00.000Z');
      const age = calculateDetailedAge(arthurBirthday);

      expect(age).toEqual({
        years: 0,
        months: 4, // March to July = 4 months
      });
    });

    it('should calculate correct age for adult pet', () => {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      threeYearsAgo.setMonth(threeYearsAgo.getMonth() - 6); // 6 months ago

      const age = calculateDetailedAge(threeYearsAgo);
      expect(age?.years).toBe(3);
      expect(age?.months).toBe(6);
    });

    it('should handle exact year boundary', () => {
      const exactlyTwoYearsAgo = new Date();
      exactlyTwoYearsAgo.setFullYear(exactlyTwoYearsAgo.getFullYear() - 2);

      const age = calculateDetailedAge(exactlyTwoYearsAgo);
      expect(age).toEqual({
        years: 2,
        months: 0,
      });
    });

    it('should handle birthday not yet occurred this year', () => {
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 2);
      dateOfBirth.setMonth(11); // December
      dateOfBirth.setDate(25); // Christmas

      const age = calculateDetailedAge(dateOfBirth);

      // If current date is before December 25, should be 1 year and some months
      // If current date is after December 25, should be 2 years and some months
      const currentDate = new Date();
      if (
        currentDate.getMonth() < 11 ||
        (currentDate.getMonth() === 11 && currentDate.getDate() < 25)
      ) {
        expect(age?.years).toBe(1);
      } else {
        expect(age?.years).toBe(2);
      }
    });

    it('should never return negative values', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const age = calculateDetailedAge(futureDate);
      expect(age?.years).toBeGreaterThanOrEqual(0);
      expect(age?.months).toBeGreaterThanOrEqual(0);
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
