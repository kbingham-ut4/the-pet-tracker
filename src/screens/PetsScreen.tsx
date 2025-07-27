import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { Pet } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { info, error } from '../utils/logging';
import { PetCard } from '../components/PetCard';
import { ScrollIndicator, EmptyState } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PetsScreen() {
  const { pets, loadPetsFromStorage, loading } = usePets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const flatListRef = useRef<FlatList<Pet>>(null);
  const scrollViewRefs = useRef<{ [key: string]: ScrollView | null }>({});

  // Log screen view
  React.useEffect(() => {
    info('Pets screen viewed', {
      context: {
        screen: 'PetsScreen',
        petCount: pets.length,
        timestamp: new Date().toISOString(),
      },
    });
  }, [pets.length]);

  // Reset scroll position to top when switching between pets
  React.useEffect(() => {
    if (pets.length > 0 && pets[currentPetIndex]) {
      const currentPetId = pets[currentPetIndex].id;
      const scrollViewRef = scrollViewRefs.current[currentPetId];

      if (scrollViewRef) {
        // Small delay to ensure the card is fully rendered
        setTimeout(() => {
          scrollViewRef.scrollTo({ y: 0, animated: true });
        }, 100);
      }
    }
  }, [currentPetIndex, pets]);

  const handleRefreshPets = async () => {
    try {
      info('Refreshing pets from storage');
      await loadPetsFromStorage();
      info('Pets refreshed successfully');
    } catch (err) {
      error('Failed to refresh pets', err);
    }
  };

  const handleNavigateToWeight = (petId: string) => {
    info('Navigation to Weight Management', {
      context: {
        screen: 'PetsScreen',
        targetScreen: 'WeightManagement',
        petId,
      },
    });
    navigation.navigate('WeightManagement', { petId });
  };

  const handleNavigateToFoodLog = (petId: string) => {
    info('Navigation to Food Log', {
      context: {
        screen: 'PetsScreen',
        targetScreen: 'FoodLog',
        petId,
      },
    });
    navigation.navigate('FoodLog', { petId });
  };

  // Set header options with add button only
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            info('Navigation to Add Pet', {
              context: {
                screen: 'PetsScreen',
                targetScreen: 'AddPet',
              },
            });
            navigation.navigate('AddPet');
          }}
          disabled={loading}
        >
          <View style={styles.addButtonCircle}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading]);

  // Handle scroll to specific pet
  const scrollToPet = (index: number) => {
    if (flatListRef.current && pets.length > 0) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentPetIndex(index);

      // Reset the scroll position of the target pet card to top
      const targetPetId = pets[index]?.id;
      if (targetPetId) {
        const scrollViewRef = scrollViewRefs.current[targetPetId];
        if (scrollViewRef) {
          // Small delay to ensure the horizontal scroll completes first
          setTimeout(() => {
            scrollViewRef.scrollTo({ y: 0, animated: true });
          }, 200);
        }
      }
    }
  };

  // Handle scroll events for horizontal navigation
  const handleHorizontalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentPetIndex && index >= 0 && index < pets.length) {
      setCurrentPetIndex(index);
    }
  };

  const renderPetCard = ({ item }: { item: Pet }) => {
    return (
      <PetCard
        ref={ref => {
          scrollViewRefs.current[item.id] = ref;
        }}
        pet={item}
        loading={loading}
        onRefresh={handleRefreshPets}
        onNavigateToWeight={handleNavigateToWeight}
        onNavigateToFoodLog={handleNavigateToFoodLog}
      />
    );
  };

  if (pets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      <ScrollIndicator
        totalItems={pets.length}
        currentIndex={currentPetIndex}
        onDotPress={scrollToPet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  addButtonCircle: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flatListContainer: {
    flexGrow: 1,
  },
});
