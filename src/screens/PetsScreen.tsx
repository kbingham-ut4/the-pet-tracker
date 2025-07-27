import React, { useState, useRef, useCallback } from 'react';
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
import { info, error } from '../utils/logger';
import { PetCard } from '../components/PetCard';
import { ScrollIndicator, EmptyState } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PetsScreen() {
  const { pets, loadPetsFromStorage, refreshPet, getPetLoadingState, loading } = usePets();
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

  const _handleRefreshPets = async () => {
    try {
      info('Refreshing pets from storage');
      await loadPetsFromStorage();
      info('Pets refreshed successfully');
    } catch (err) {
      error('Failed to refresh pets', { error: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleNavigateToWeight = useCallback(
    (petId: string) => {
      info('Navigation to Weight Management', {
        context: {
          screen: 'PetsScreen',
          targetScreen: 'WeightManagement',
          petId,
        },
      });
      navigation.navigate('WeightManagement', { petId });
    },
    [navigation]
  );

  const handleNavigateToFoodLog = useCallback(
    (petId: string) => {
      info('Navigation to Food Log', {
        context: {
          screen: 'PetsScreen',
          targetScreen: 'FoodLog',
          petId,
        },
      });
      navigation.navigate('FoodLog', { petId });
    },
    [navigation]
  );

  // Smart refresh function that only refreshes the currently visible pet
  const handleRefreshPet = useCallback(
    async (petId: string) => {
      // Only refresh the pet if it's currently visible to avoid unnecessary renders
      const petIndex = pets.findIndex(pet => pet.id === petId);
      const isCurrentlyVisible = petIndex === currentPetIndex;

      if (isCurrentlyVisible) {
        info('Refreshing currently visible pet', {
          context: {
            screen: 'PetsScreen',
            petId,
            petIndex,
            isCurrentlyVisible,
          },
        });
        await refreshPet(petId);
      } else {
        info('Skipping refresh for non-visible pet', {
          context: {
            screen: 'PetsScreen',
            petId,
            petIndex,
            currentPetIndex,
            isCurrentlyVisible,
          },
        });
      }
    },
    [pets, currentPetIndex, refreshPet]
  );

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

  // Handle scroll to specific pet (no auto-refresh, only on user interaction)
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

  // Handle scroll events for horizontal navigation (no auto-refresh)
  const handleHorizontalScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / SCREEN_WIDTH);
      if (index !== currentPetIndex && index >= 0 && index < pets.length) {
        const previousIndex = currentPetIndex;
        setCurrentPetIndex(index);

        info('Pet card scroll detected', {
          context: {
            screen: 'PetsScreen',
            previousPetIndex: previousIndex,
            newPetIndex: index,
            petId: pets[index]?.id,
            petName: pets[index]?.name,
          },
        });
      }
    },
    [currentPetIndex, pets]
  );

  // Optimized render function with detailed logging
  const renderPetCard = useCallback(
    ({ item, index }: { item: Pet; index: number }) => {
      const petLoading = getPetLoadingState(item.id);

      // Log only when development mode for debugging
      if (__DEV__) {
        info('Rendering pet card', {
          context: {
            screen: 'PetsScreen',
            petId: item.id,
            petName: item.name,
            index,
            currentPetIndex,
            isCurrentCard: index === currentPetIndex,
          },
        });
      }

      return (
        <PetCard
          ref={ref => {
            scrollViewRefs.current[item.id] = ref;
          }}
          pet={item}
          loading={petLoading}
          onRefresh={handleRefreshPet}
          onNavigateToWeight={handleNavigateToWeight}
          onNavigateToFoodLog={handleNavigateToFoodLog}
        />
      );
    },
    [
      currentPetIndex,
      getPetLoadingState,
      handleRefreshPet,
      handleNavigateToWeight,
      handleNavigateToFoodLog,
    ]
  );

  const keyExtractor = useCallback((item: Pet) => item.id, []);

  if (pets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        ref={flatListRef}
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={100}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        // Ultra-optimized settings for single-card rendering
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={1}
        removeClippedSubviews={true}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100,
          minimumViewTime: 300,
        }}
        // Prevent over-scrolling and momentum
        bounces={false}
        scrollEnabled={!loading}
        disableIntervalMomentum={true}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        // Optimize rendering
        legacyImplementation={false}
        updateCellsBatchingPeriod={150}
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
});
