import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { PetProvider } from './src/contexts/PetContext';

export default function App() {
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
});
