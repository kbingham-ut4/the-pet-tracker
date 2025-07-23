# Environment Setup

This project supports multiple environments with different configurations for development, testing, staging, and production.

## Overview

Pet Tracker uses environment-specific configuration to manage:

- API endpoints
- Feature flags
- Logging levels
- Analytics settings
- Database configurations
- Third-party service keys

## Environment Types

### Development

- **Purpose**: Local development and debugging
- **Features**: Debug mode, detailed logging, local APIs
- **Database**: Local development database
- **Analytics**: Disabled for privacy

### Testing

- **Purpose**: Automated testing and QA
- **Features**: Test APIs, separate database, mock services
- **Database**: Isolated test database
- **Analytics**: Disabled to avoid test data pollution

### Staging

- **Purpose**: Pre-production testing
- **Features**: Production-like environment for final validation
- **Database**: Staging database with production-like data
- **Analytics**: Enabled for testing analytics integration

### Production

- **Purpose**: Live application for end users
- **Features**: Optimized performance, minimal logging
- **Database**: Production database
- **Analytics**: Fully enabled for user insights

## Quick Setup

1. **Copy the example environment file**:

   ```bash
   cp .env.example .env
   ```

2. **Choose your environment** by editing `.env`:

   ```bash
   EXPO_PUBLIC_ENV=development
   APP_VARIANT=development
   ```

3. **Start with environment-specific commands**:
   ```bash
   npm run start:dev      # Development
   npm run start:test     # Testing
   npm run start:staging  # Staging
   npm run start:prod     # Production
   ```

## Environment Variables

### Core Configuration

| Variable                   | Description            | Example                 |
| -------------------------- | ---------------------- | ----------------------- |
| `EXPO_PUBLIC_ENV`          | Current environment    | `development`           |
| `APP_VARIANT`              | App variant for builds | `development`           |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL           | `http://localhost:3001` |
| `EXPO_PUBLIC_API_TIMEOUT`  | API timeout in ms      | `10000`                 |

### Feature Flags

| Variable                             | Description            | Default       |
| ------------------------------------ | ---------------------- | ------------- |
| `EXPO_PUBLIC_ENABLE_LOGGING`         | Enable console logging | `true` (dev)  |
| `EXPO_PUBLIC_ENABLE_DEBUG`           | Enable debug mode      | `true` (dev)  |
| `EXPO_PUBLIC_ENABLE_ANALYTICS`       | Enable analytics       | `false` (dev) |
| `EXPO_PUBLIC_ENABLE_CRASH_REPORTING` | Enable crash reporting | `false` (dev) |

### External Services

| Variable                        | Description         | Where to Get                                            |
| ------------------------------- | ------------------- | ------------------------------------------------------- |
| `EXPO_PUBLIC_SENTRY_DSN`        | Error tracking      | [Sentry.io](https://sentry.io)                          |
| `EXPO_PUBLIC_FIREBASE_ENABLED`  | Firebase analytics  | [Firebase Console](https://console.firebase.google.com) |
| `EXPO_PUBLIC_MIXPANEL_TOKEN`    | Mixpanel analytics  | [Mixpanel Dashboard](https://mixpanel.com)              |
| `EXPO_PUBLIC_AMPLITUDE_API_KEY` | Amplitude analytics | [Amplitude Dashboard](https://amplitude.com)            |

## Environment-Specific Scripts

### Development Commands

```bash
npm run start:dev        # Start development server
npm run android:dev      # Start Android development
npm run ios:dev          # Start iOS development
npm run build:dev        # Build development version
```

### Testing Commands

```bash
npm run start:test       # Start testing server
npm run android:test     # Start Android testing
npm run ios:test         # Start iOS testing
npm run build:test       # Build testing version
```

### Staging Commands

```bash
npm run start:staging    # Start staging server
npm run android:staging  # Start Android staging
npm run ios:staging      # Start iOS staging
npm run build:staging    # Build staging version
```

### Production Commands

```bash
npm run start:prod       # Start production server
npm run build:prod       # Build production version
npm run submit:prod      # Submit to app stores
```

## Configuration in Code

Access environment configuration in your React Native code:

```typescript
import { config } from '@/config';

// Environment information
console.log(config.environment); // 'development'
console.log(config.apiBaseUrl); // 'http://localhost:3001'
console.log(config.enableLogging); // true

// Feature flags
if (config.features.enableOfflineMode) {
  // Enable offline functionality
}

// Environment-specific behavior
if (config.environment === 'development') {
  // Development-only code
}
```

## Logging

Use the environment-aware logger:

```typescript
import { logger } from '@/utils';

logger.debug('Debug message'); // Only in dev/testing
logger.info('Info message'); // When logging enabled
logger.warn('Warning message'); // Always when logging enabled
logger.error('Error message'); // Always when logging enabled
```

## Build Configuration

Different app variants are created for each environment:

### Development

- **App Name**: Pet Tracker (Dev)
- **Bundle ID**: `com.pettracker.app.dev`
- **Icon**: Development icon with overlay

### Staging

- **App Name**: Pet Tracker (Staging)
- **Bundle ID**: `com.pettracker.app.staging`
- **Icon**: Staging icon with overlay

### Production

- **App Name**: Pet Tracker
- **Bundle ID**: `com.pettracker.app`
- **Icon**: Production icon

## Security Best Practices

### Environment Files

- ✅ Keep `.env.example` with dummy values
- ✅ Add all `.env.*` files to `.gitignore`
- ✅ Never commit real API keys or secrets
- ✅ Use different service accounts per environment

### Key Management

- 🔐 Use separate API keys for each environment
- 🔐 Rotate production keys regularly
- 🔐 Limit permissions to minimum required
- 🔐 Monitor key usage for anomalies

### Data Isolation

- 🏗️ Use separate databases per environment
- 🏗️ Prefix storage keys with environment
- 🏗️ Isolate analytics and error tracking
- 🏗️ Test data migrations in staging first

## Troubleshooting

### Environment Not Loading

```bash
# Check environment variable
echo $EXPO_PUBLIC_ENV

# Verify config loading
npm run type-check
```

### Build Issues

```bash
# Clear Expo cache
npx expo start --clear

# Reset environment
rm .env && cp .env.example .env
```

### API Connection Issues

```bash
# Check API URL in logs
npm run start:dev

# Test API endpoint
curl $EXPO_PUBLIC_API_BASE_URL/health
```

## Next Steps

- [Analytics Setup](../configuration/analytics) - Set up analytics services
- [Error Tracking](../configuration/error-tracking) - Configure error tracking
- [Building](../deployment/building) - Build for different environments
