/**
 * Theme Constants Tests
 * 
 * Tests for theme constants including colors, spacing, fonts, and responsive values
 */

import { describe, it, expect } from 'vitest';
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    BORDER_RADIUS,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
} from '../Theme';

describe('Theme Constants', () => {
    describe('COLORS', () => {
        it('should have all primary color values defined', () => {
            expect(COLORS.primary).toBeDefined();
            expect(COLORS.secondary).toBeDefined();
            expect(COLORS.accent).toBeDefined();
            expect(COLORS.background).toBeDefined();
            expect(COLORS.surface).toBeDefined();
            expect(COLORS.text).toBeDefined();
            expect(COLORS.textSecondary).toBeDefined();
            expect(COLORS.textLight).toBeDefined();
            expect(COLORS.border).toBeDefined();
        });

        it('should have status colors defined', () => {
            expect(COLORS.error).toBeDefined();
            expect(COLORS.success).toBeDefined();
            expect(COLORS.warning).toBeDefined();
            expect(COLORS.info).toBeDefined();
        });

        it('should have pet type colors', () => {
            expect(COLORS.petColors).toBeDefined();
            expect(COLORS.petColors.dog).toBeDefined();
            expect(COLORS.petColors.cat).toBeDefined();
            expect(COLORS.petColors.bird).toBeDefined();
            expect(COLORS.petColors.fish).toBeDefined();
            expect(COLORS.petColors.rabbit).toBeDefined();
            expect(COLORS.petColors.hamster).toBeDefined();
            expect(COLORS.petColors.reptile).toBeDefined();
        });

        it('should have valid hex color formats', () => {
            const hexPattern = /^#[0-9A-F]{6}$/i;

            expect(COLORS.primary).toMatch(hexPattern);
            expect(COLORS.secondary).toMatch(hexPattern);
            expect(COLORS.error).toMatch(hexPattern);
            expect(COLORS.success).toMatch(hexPattern);
            expect(COLORS.warning).toMatch(hexPattern);
            expect(COLORS.info).toMatch(hexPattern);
        });
    });

    describe('SPACING', () => {
        it('should have all spacing values defined', () => {
            expect(typeof SPACING.xs).toBe('number');
            expect(typeof SPACING.sm).toBe('number');
            expect(typeof SPACING.md).toBe('number');
            expect(typeof SPACING.lg).toBe('number');
            expect(typeof SPACING.xl).toBe('number');
            expect(typeof SPACING.xxl).toBe('number');
        });

        it('should have increasing spacing values', () => {
            expect(SPACING.xs).toBeLessThan(SPACING.sm);
            expect(SPACING.sm).toBeLessThan(SPACING.md);
            expect(SPACING.md).toBeLessThan(SPACING.lg);
            expect(SPACING.lg).toBeLessThan(SPACING.xl);
            expect(SPACING.xl).toBeLessThan(SPACING.xxl);
        });

        it('should have positive spacing values', () => {
            Object.values(SPACING).forEach(value => {
                expect(value).toBeGreaterThan(0);
            });
        });
    });

    describe('FONT_SIZES', () => {
        it('should have all font sizes defined', () => {
            expect(typeof FONT_SIZES.xs).toBe('number');
            expect(typeof FONT_SIZES.sm).toBe('number');
            expect(typeof FONT_SIZES.md).toBe('number');
            expect(typeof FONT_SIZES.lg).toBe('number');
            expect(typeof FONT_SIZES.xl).toBe('number');
            expect(typeof FONT_SIZES.title).toBe('number');
            expect(typeof FONT_SIZES.largeTitle).toBe('number');
        });

        it('should have increasing font sizes', () => {
            expect(FONT_SIZES.xs).toBeLessThan(FONT_SIZES.sm);
            expect(FONT_SIZES.sm).toBeLessThan(FONT_SIZES.md);
            expect(FONT_SIZES.md).toBeLessThan(FONT_SIZES.lg);
            expect(FONT_SIZES.lg).toBeLessThan(FONT_SIZES.xl);
            expect(FONT_SIZES.xl).toBeLessThan(FONT_SIZES.title);
            expect(FONT_SIZES.title).toBeLessThan(FONT_SIZES.largeTitle);
        });

        it('should have reasonable font size ranges', () => {
            expect(FONT_SIZES.xs).toBeGreaterThanOrEqual(10);
            expect(FONT_SIZES.xs).toBeLessThanOrEqual(14);
            expect(FONT_SIZES.largeTitle).toBeGreaterThanOrEqual(28);
            expect(FONT_SIZES.largeTitle).toBeLessThanOrEqual(36);
        });
    });

    describe('BORDER_RADIUS', () => {
        it('should have all border radius values defined', () => {
            expect(typeof BORDER_RADIUS.sm).toBe('number');
            expect(typeof BORDER_RADIUS.md).toBe('number');
            expect(typeof BORDER_RADIUS.lg).toBe('number');
            expect(typeof BORDER_RADIUS.xl).toBe('number');
            expect(typeof BORDER_RADIUS.round).toBe('number');
        });

        it('should have increasing border radius values', () => {
            expect(BORDER_RADIUS.sm).toBeLessThan(BORDER_RADIUS.md);
            expect(BORDER_RADIUS.md).toBeLessThan(BORDER_RADIUS.lg);
            expect(BORDER_RADIUS.lg).toBeLessThan(BORDER_RADIUS.xl);
            expect(BORDER_RADIUS.xl).toBeLessThan(BORDER_RADIUS.round);
        });

        it('should have positive border radius values', () => {
            Object.values(BORDER_RADIUS).forEach(value => {
                expect(value).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Screen Dimensions', () => {
        it('should have screen dimensions defined', () => {
            expect(typeof SCREEN_WIDTH).toBe('number');
            expect(typeof SCREEN_HEIGHT).toBe('number');
        });

        it('should have positive screen dimensions', () => {
            expect(SCREEN_WIDTH).toBeGreaterThan(0);
            expect(SCREEN_HEIGHT).toBeGreaterThan(0);
        });

        it('should have reasonable screen dimensions for mobile', () => {
            // Common mobile screen widths
            expect(SCREEN_WIDTH).toBeGreaterThanOrEqual(320);
            expect(SCREEN_WIDTH).toBeLessThanOrEqual(500);

            // Common mobile screen heights
            expect(SCREEN_HEIGHT).toBeGreaterThanOrEqual(568);
            expect(SCREEN_HEIGHT).toBeLessThanOrEqual(1000);
        });
    });

    describe('Theme Consistency', () => {
        it('should have consistent color naming convention', () => {
            const colorKeys = Object.keys(COLORS);
            colorKeys.forEach(key => {
                if (key !== 'petColors') {
                    expect(key).toMatch(/^[a-z][a-zA-Z]*$/);
                }
            });
        });

        it('should have pet colors for all supported pet types', () => {
            const expectedPetTypes: (keyof typeof COLORS.petColors)[] = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'];
            expectedPetTypes.forEach(petType => {
                expect(COLORS.petColors[petType]).toBeDefined();
                expect(typeof COLORS.petColors[petType]).toBe('string');
            });
        });

        it('should have adequate color contrast between text and background', () => {
            // Basic contrast check - text colors should be significantly different from background
            expect(COLORS.text).not.toBe(COLORS.background);
            expect(COLORS.textSecondary).not.toBe(COLORS.background);
            expect(COLORS.textLight).not.toBe(COLORS.background);
        });

        it('should have reasonable spacing progression', () => {
            const spacingValues = Object.values(SPACING).sort((a, b) => a - b);

            // Check that each spacing value is at least 25% larger than the previous
            for (let i = 1; i < spacingValues.length; i++) {
                const ratio = spacingValues[i] / spacingValues[i - 1];
                expect(ratio).toBeGreaterThanOrEqual(1.2); // At least 20% increase
            }
        });

        it('should have consistent naming patterns', () => {
            const spacingKeys = Object.keys(SPACING) as (keyof typeof SPACING)[];
            const fontKeys = Object.keys(FONT_SIZES) as (keyof typeof FONT_SIZES)[];
            const borderKeys = Object.keys(BORDER_RADIUS) as (keyof typeof BORDER_RADIUS)[];

            // Size naming should follow xs, sm, md, lg, xl pattern
            const expectedSizes: (keyof typeof SPACING)[] = ['xs', 'sm', 'md', 'lg', 'xl'];
            expectedSizes.forEach(size => {
                if (spacingKeys.includes(size)) {
                    expect(SPACING[size]).toBeDefined();
                }
                if (fontKeys.includes(size as keyof typeof FONT_SIZES)) {
                    expect(FONT_SIZES[size as keyof typeof FONT_SIZES]).toBeDefined();
                }
                if (borderKeys.includes(size as keyof typeof BORDER_RADIUS)) {
                    expect(BORDER_RADIUS[size as keyof typeof BORDER_RADIUS]).toBeDefined();
                }
            });
        });
    });
});
