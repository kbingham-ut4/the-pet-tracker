# Analytics Setup Guide

This guide explains how to set up analytics for the Pet Tracker app across different environments.

## 🎯 **Recommended: Firebase Analytics**

Firebase Analytics is free, comprehensive, and works great with React Native/Expo apps.

### Setup Steps:

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it "Pet Tracker" (or your preferred name)

2. **Add Your App**
   - Click "Add app" → Select iOS/Android
   - **iOS Bundle ID**: `com.pettracker.app.dev` (development)
   - **Android Package**: `com.pettracker.app.dev` (development)
   - Download config files:
     - `GoogleService-Info.plist` (iOS)
     - `google-services.json` (Android)

3. **Install Dependencies**

   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/analytics
   ```

4. **Configure Environment**

   ```bash
   # In .env files, set:
   EXPO_PUBLIC_FIREBASE_ENABLED=true
   ```

5. **Add Config Files**
   - Place `google-services.json` in project root
   - Add to `app.config.js`:
   ```javascript
   plugins: ['@react-native-firebase/app', '@react-native-firebase/analytics'];
   ```

## 🔄 **Alternative: Mixpanel**

Event-based analytics with detailed user tracking.

### Setup Steps:

1. **Create Account**
   - Go to [Mixpanel.com](https://mixpanel.com/)
   - Sign up and create project

2. **Get Project Token**
   - Dashboard → Settings → Project Settings
   - Copy "Project Token"

3. **Install Dependencies**

   ```bash
   npx expo install mixpanel-react-native
   ```

4. **Configure Environment**
   ```bash
   # In .env files:
   EXPO_PUBLIC_MIXPANEL_TOKEN=your-project-token-here
   ```

## 📊 **Alternative: Amplitude**

Product analytics focused on user behavior.

### Setup Steps:

1. **Create Account**
   - Go to [Amplitude.com](https://amplitude.com/)
   - Sign up and create project

2. **Get API Key**
   - Settings → General → API Keys
   - Copy "API Key"

3. **Install Dependencies**

   ```bash
   npx expo install @amplitude/analytics-react-native
   ```

4. **Configure Environment**
   ```bash
   # In .env files:
   EXPO_PUBLIC_AMPLITUDE_API_KEY=your-api-key-here
   ```

## 🎛 **Environment-Specific Setup**

### Development

- Use test/development projects
- Enable all logging
- Separate from production data

### Testing

- Use dedicated test projects
- Mock analytics calls in unit tests
- Separate analytics events

### Staging

- Mirror production setup
- Use staging projects
- Test all analytics flows

### Production

- Use production projects
- Minimal logging
- Real user data

## 🛠 **Implementation Example**

Create `src/services/Analytics.ts`:

```typescript
import { config } from '../config';

class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!this.instance) {
      this.instance = new AnalyticsService();
    }
    return this.instance;
  }

  async initialize() {
    if (!config.analyticsEnabled) return;

    if (process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true') {
      // Initialize Firebase Analytics
      const analytics = await import('@react-native-firebase/analytics');
      await analytics.default().setAnalyticsCollectionEnabled(true);
    }

    if (process.env.EXPO_PUBLIC_MIXPANEL_TOKEN) {
      // Initialize Mixpanel
      const { Mixpanel } = await import('mixpanel-react-native');
      const mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN);
      await mixpanel.init();
    }

    if (process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY) {
      // Initialize Amplitude
      const amplitude = await import('@amplitude/analytics-react-native');
      amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY);
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!config.analyticsEnabled) return;

    // Track with your chosen service
    console.log(`Analytics: ${eventName}`, properties);
  }
}

export const analytics = AnalyticsService.getInstance();
```

## 🔒 **Privacy Considerations**

- **GDPR Compliance**: Ask for consent before tracking
- **Data Minimization**: Only track necessary events
- **Anonymization**: Avoid tracking PII
- **Opt-out**: Provide analytics disable option

## 📱 **Events to Track**

For Pet Tracker app:

- `pet_added`
- `weight_logged`
- `food_entry_added`
- `vet_visit_scheduled`
- `app_opened`
- `screen_viewed`

## 🚫 **What NOT to Track**

- Personal information (names, emails)
- Sensitive pet health data
- Location data without consent
- Any financial information
