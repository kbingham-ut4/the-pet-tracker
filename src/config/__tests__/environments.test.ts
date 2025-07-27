import { describe, it, expect, vi } from 'vitest';
import config, {
  developmentConfig,
  testingConfig,
  stagingConfig,
  productionConfig,
} from '../environments';

// Mock React Native Platform
vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: vi.fn(),
  },
}));

describe('Environment Configuration', () => {
  describe('default config', () => {
    it('should export a frozen config object', () => {
      expect(config).toBeDefined();
      expect(Object.isFrozen(config)).toBe(true);
    });

    it('should have required properties', () => {
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('apiBaseUrl');
      expect(config).toHaveProperty('apiTimeout');
      expect(config).toHaveProperty('enableLogging');
      expect(config).toHaveProperty('enableDebugMode');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('constants');
    });

    it('should have valid features configuration', () => {
      expect(config.features).toHaveProperty('enableOfflineMode');
      expect(config.features).toHaveProperty('enablePushNotifications');
      expect(config.features).toHaveProperty('enableBiometricAuth');
      expect(config.features).toHaveProperty('enableDataExport');
      expect(config.features).toHaveProperty('enableAdvancedNutrition');
    });

    it('should have valid database configuration', () => {
      expect(config.database).toHaveProperty('name');
      expect(config.database).toHaveProperty('version');
      expect(typeof config.database.name).toBe('string');
      expect(typeof config.database.version).toBe('number');
    });

    it('should have valid constants', () => {
      expect(config.constants).toHaveProperty('maxPetPhotos');
      expect(config.constants).toHaveProperty('maxWeightRecords');
      expect(config.constants).toHaveProperty('supportEmail');
      expect(config.constants).toHaveProperty('privacyPolicyUrl');
      expect(config.constants).toHaveProperty('termsOfServiceUrl');

      expect(typeof config.constants.maxPetPhotos).toBe('number');
      expect(typeof config.constants.maxWeightRecords).toBe('number');
      expect(typeof config.constants.supportEmail).toBe('string');
      expect(config.constants.supportEmail).toContain('@');
    });
  });

  describe('development config', () => {
    it('should have development-specific settings', () => {
      expect(developmentConfig.environment).toBe('development');
      expect(developmentConfig.enableLogging).toBe(true);
      expect(developmentConfig.enableDebugMode).toBe(true);
    });

    it('should have valid API configuration', () => {
      expect(developmentConfig.apiBaseUrl).toBeTruthy();
      expect(developmentConfig.apiTimeout).toBeGreaterThan(0);
      expect(developmentConfig.maxRetryAttempts).toBeGreaterThan(0);
    });
  });

  describe('production config', () => {
    it('should have production-specific settings', () => {
      expect(productionConfig.environment).toBe('production');
      expect(productionConfig.enableDebugMode).toBe(false);
      expect(productionConfig.crashReportingEnabled).toBe(true);
      expect(productionConfig.analyticsEnabled).toBe(true);
    });
  });

  describe('testing config', () => {
    it('should have testing-specific settings', () => {
      expect(testingConfig.environment).toBe('testing');
      expect(testingConfig.enableLogging).toBe(true);
      expect(testingConfig.crashReportingEnabled).toBe(false);
      expect(testingConfig.analyticsEnabled).toBe(false);
    });
  });

  describe('staging config', () => {
    it('should have staging-specific settings', () => {
      expect(stagingConfig.environment).toBe('staging');
      expect(stagingConfig.enableDebugMode).toBe(false);
      expect(stagingConfig.crashReportingEnabled).toBe(true);
    });
  });

  describe('configuration validation', () => {
    const configs = [developmentConfig, testingConfig, stagingConfig, productionConfig];

    it('should have valid API configuration for all environments', () => {
      configs.forEach(envConfig => {
        expect(envConfig.apiBaseUrl).toBeTruthy();
        expect(envConfig.apiTimeout).toBeGreaterThan(0);
        expect(envConfig.maxRetryAttempts).toBeGreaterThan(0);
        expect(envConfig.cacheTimeout).toBeGreaterThan(0);
      });
    });

    it('should have valid storage configuration for all environments', () => {
      configs.forEach(envConfig => {
        expect(envConfig.storagePrefix).toBeTruthy();
        expect(typeof envConfig.storagePrefix).toBe('string');
      });
    });

    it('should have boolean flags correctly set for all environments', () => {
      configs.forEach(envConfig => {
        expect(typeof envConfig.enableLogging).toBe('boolean');
        expect(typeof envConfig.enableDebugMode).toBe('boolean');
        expect(typeof envConfig.crashReportingEnabled).toBe('boolean');
        expect(typeof envConfig.analyticsEnabled).toBe('boolean');
      });
    });
  });

  describe('feature flags', () => {
    it('should have all required feature flags in all configs', () => {
      const configs = [developmentConfig, testingConfig, stagingConfig, productionConfig];

      const requiredFeatures = [
        'enableOfflineMode',
        'enablePushNotifications',
        'enableBiometricAuth',
        'enableDataExport',
        'enableAdvancedNutrition',
      ];

      configs.forEach(envConfig => {
        requiredFeatures.forEach(feature => {
          expect(envConfig.features).toHaveProperty(feature);
          expect(typeof (envConfig.features as Record<string, boolean>)[feature]).toBe('boolean');
        });
      });
    });
  });
});
