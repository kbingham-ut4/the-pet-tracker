import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Pet } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { info } from '../utils/logger';

/**
 * Custom hook for handling navigation logic in PetsScreen
 * Separates navigation concerns from the main component
 */
export const usePetScreenNavigation = (pets: Pet[]) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleNavigateToWeight = useCallback(
    (petId: string) => {
      const pet = pets.find(p => p.id === petId);
      info('Navigation to Weight Management', {
        context: {
          screen: 'PetsScreen',
          targetScreen: 'WeightManagement',
          petId,
          petName: pet?.name,
        },
      });
      navigation.navigate('WeightManagement', { petId });
    },
    [navigation, pets]
  );

  const handleNavigateToFoodLog = useCallback(
    (petId: string) => {
      const pet = pets.find(p => p.id === petId);
      info('Navigation to Food Log', {
        context: {
          screen: 'PetsScreen',
          targetScreen: 'FoodLog',
          petId,
          petName: pet?.name,
        },
      });
      navigation.navigate('FoodLog', { petId });
    },
    [navigation, pets]
  );

  const handleNavigateToAddPet = useCallback(() => {
    info('Navigation to Add Pet', {
      context: {
        screen: 'PetsScreen',
        targetScreen: 'AddPet',
      },
    });
    navigation.navigate('AddPet');
  }, [navigation]);

  return {
    handleNavigateToWeight,
    handleNavigateToFoodLog,
    handleNavigateToAddPet,
  };
};
