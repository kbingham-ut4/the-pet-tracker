import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TabNavigator from './TabNavigator';
import WeightManagementScreen from '../screens/WeightManagementScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import { AddPetScreen } from '../screens';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AddPet" component={AddPetScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="WeightManagement"
          component={WeightManagementScreen}
          options={{ headerShown: true, title: 'Weight Management' }}
        />
        <Stack.Screen
          name="FoodLog"
          component={FoodLogScreen}
          options={{ headerShown: true, title: 'Food Log' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
