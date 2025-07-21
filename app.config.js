const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';
const IS_PRODUCTION = process.env.APP_VARIANT === 'production';

const getAppName = () => {
    if (IS_DEV) return 'Pet Tracker (Dev)';
    if (IS_STAGING) return 'Pet Tracker (Staging)';
    return 'Pet Tracker';
};

const getBundleIdentifier = () => {
    const base = 'com.pettracker.app';
    if (IS_DEV) return `${base}.dev`;
    if (IS_STAGING) return `${base}.staging`;
    return base;
};

const getAppIcon = () => {
    if (IS_DEV) return './assets/icon-dev.png';
    if (IS_STAGING) return './assets/icon-staging.png';
    return './assets/icon.png';
};

const getScheme = () => {
    if (IS_DEV) return 'pettracker-dev';
    if (IS_STAGING) return 'pettracker-staging';
    return 'pettracker';
};

export default {
    expo: {
        name: getAppName(),
        slug: IS_DEV ? 'pet-tracker-dev' : IS_STAGING ? 'pet-tracker-staging' : 'pet-tracker',
        version: '1.0.0',
        orientation: 'portrait',
        icon: getAppIcon(),
        userInterfaceStyle: 'light',
        newArchEnabled: true,
        scheme: getScheme(),
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        assetBundlePatterns: [
            '**/*'
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: getBundleIdentifier(),
            buildNumber: '1',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff'
            },
            package: getBundleIdentifier(),
            versionCode: 1,
            edgeToEdgeEnabled: true,
        },
        web: {
            favicon: './assets/favicon.png',
            bundler: 'metro'
        },
        extra: {
            environment: process.env.APP_VARIANT || 'development',
            eas: {
                projectId: process.env.EXPO_PROJECT_ID
            }
        },
        updates: {
            url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID}`
        },
        runtimeVersion: {
            policy: 'sdkVersion'
        },
        plugins: [
            'expo-camera',
            'expo-image-picker',
            'expo-location',
            [
                'expo-notifications',
                {
                    icon: './assets/notification-icon.png',
                    color: '#ffffff'
                }
            ]
        ]
    }
};
