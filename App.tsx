import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { PetProvider } from './src/contexts/PetContext';
import { info } from './src/utils/logger';
import { StorageFactory } from './src/storage';

export default function App() {
  const [isLoggerInitialized, setIsLoggerInitialized] = useState(false);
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);

  useEffect(() => {
    // Initialize systems on app startup
    const initSystems = async () => {
      try {
        // Logger is now automatically initialized
        // No initialization needed for the simple logger

        setIsLoggerInitialized(true);

        // Initialize storage system
        await StorageFactory.createStorageManager();

        info('Pet Tracker systems initialized successfully', {
          context: {
            isDevelopment: __DEV__,
            timestamp: new Date().toISOString(),
            localStorage: process.env.EXPO_PUBLIC_ENABLE_LOCAL_STORAGE === 'true',
            cloudSync: process.env.EXPO_PUBLIC_ENABLE_CLOUD_SYNC === 'true',
          },
        });

        setIsStorageInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app systems:', err);
        // Allow app to continue with limited functionality
        setIsLoggerInitialized(true);
        setIsStorageInitialized(true);
      }
    };

    initSystems();
  }, []);

  // Show loading screen while systems are initializing
  if (!isLoggerInitialized || !isStorageInitialized) {
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
