import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { PetProvider } from './src/contexts/PetContext';
import { initializeLogger, info } from './src/utils/logging';

export default function App() {
  const [isLoggerInitialized, setIsLoggerInitialized] = useState(false);

  useEffect(() => {
    // Initialize logging system on app startup
    const initLogging = async () => {
      try {
        await initializeLogger({
          enableConsole: true,
          enableBetterStack: !__DEV__, // Only enable in production/staging
          betterStackToken: process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN,
          logLevel: __DEV__ ? 'debug' : 'info',
          context: {
            appVersion: '1.0.0',
            platform: 'mobile',
            environment: process.env.EXPO_PUBLIC_ENV || 'development'
          }
        });

        info('Pet Tracker app started successfully', {
          context: {
            isDevelopment: __DEV__,
            timestamp: new Date().toISOString()
          }
        });

        setIsLoggerInitialized(true);
      } catch (err) {
        console.error('Failed to initialize logging system:', err);
        // App can still function without logging
        setIsLoggerInitialized(true); // Allow app to continue
      }
    };

    initLogging();
  }, []);

  // Show loading screen while logger is initializing
  if (!isLoggerInitialized) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PetProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </PetProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
