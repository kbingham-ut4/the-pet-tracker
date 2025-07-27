import { Platform } from 'react-native';

export interface AppConfig {
  environment: 'development' | 'testing' | 'staging' | 'production';
  apiBaseUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableDebugMode: boolean;
  crashReportingEnabled: boolean;
  analyticsEnabled: boolean;
  storagePrefix: string;
  maxRetryAttempts: number;
  cacheTimeout: number;
  features: {
    enableOfflineMode: boolean;
    enablePushNotifications: boolean;
    enableBiometricAuth: boolean;
    enableDataExport: boolean;
    enableAdvancedNutrition: boolean;
  };
  database: {
    name: string;
    version: number;
  };
  constants: {
    maxPetPhotos: number;
    maxWeightRecords: number;
    supportEmail: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
}

const baseConfig: Omit<
  AppConfig,
  | 'environment'
  | 'apiBaseUrl'
  | 'enableLogging'
  | 'enableDebugMode'
  | 'crashReportingEnabled'
  | 'analyticsEnabled'
> = {
  apiTimeout: 10000,
  storagePrefix: 'pet_tracker_',
  maxRetryAttempts: 3,
  cacheTimeout: 300000, // 5 minutes
  features: {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableBiometricAuth: false,
    enableDataExport: true,
    enableAdvancedNutrition: true,
  },
  database: {
    name: 'pet_tracker_db',
    version: 1,
  },
  constants: {
    maxPetPhotos: 10,
    maxWeightRecords: 1000,
    supportEmail: 'support@pettracker.app',
    privacyPolicyUrl: 'https://pettracker.app/privacy',
    termsOfServiceUrl: 'https://pettracker.app/terms',
  },
};

const developmentConfig: AppConfig = {
  ...baseConfig,
  environment: 'development',
  apiBaseUrl: __DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:3001'
      : 'http://localhost:3001'
    : 'https://dev-api.pettracker.app',
  enableLogging: true,
  enableDebugMode: true,
  crashReportingEnabled: false,
  analyticsEnabled: false,
  features: {
    ...baseConfig.features,
    enableBiometricAuth: false, // Disable for easier dev testing
  },
};

const testingConfig: AppConfig = {
  ...baseConfig,
  environment: 'testing',
  apiBaseUrl: 'https://test-api.pettracker.app',
  enableLogging: true,
  enableDebugMode: true,
  crashReportingEnabled: false,
  analyticsEnabled: false,
  storagePrefix: 'pet_tracker_test_',
  database: {
    name: 'pet_tracker_test_db',
    version: 1,
  },
};

const stagingConfig: AppConfig = {
  ...baseConfig,
  environment: 'staging',
  apiBaseUrl: 'https://staging-api.pettracker.app',
  enableLogging: true,
  enableDebugMode: false,
  crashReportingEnabled: true,
  analyticsEnabled: true,
};

const productionConfig: AppConfig = {
  ...baseConfig,
  environment: 'production',
  apiBaseUrl: 'https://api.pettracker.app',
  enableLogging: false,
  enableDebugMode: false,
  crashReportingEnabled: true,
  analyticsEnabled: true,
  apiTimeout: 15000, // Longer timeout for production
};

// Determine environment from Expo Constants or environment variables
function getEnvironment(): AppConfig['environment'] {
  // Check for explicit environment variable first
  if (process.env.EXPO_PUBLIC_ENV) {
    const env = process.env.EXPO_PUBLIC_ENV;
    if (['development', 'testing', 'staging', 'production'].includes(env)) {
      return env as AppConfig['environment'];
    }
  }

  // Check if we're in development mode
  if (__DEV__) {
    return 'development';
  }

  // Default to production for release builds
  return 'production';
}

const environment = getEnvironment();

let config: AppConfig;
switch (environment) {
  case 'testing':
    config = testingConfig;
    break;
  case 'staging':
    config = stagingConfig;
    break;
  case 'production':
    config = productionConfig;
    break;
  case 'development':
  default:
    config = developmentConfig;
    break;
}

// Freeze the config to prevent accidental modifications
export default Object.freeze(config);

// Export individual configs for testing purposes
export { developmentConfig, testingConfig, stagingConfig, productionConfig };
