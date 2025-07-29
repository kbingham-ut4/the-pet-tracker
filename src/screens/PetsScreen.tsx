import React, { useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { View, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING } from '../constants';
import { usePets } from '../contexts';
import { Pet } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { info, error, debug } from '../utils/logger';
import { EmptyState, PetListHeader, LoadingOverlay, PetList } from '../components';
import { usePetScreenNavigation, usePetScrolling } from '../hooks';

// Lazy load components for better performance
const ScrollIndicator = lazy(() =>
  import('../components').then(module => ({ default: module.ScrollIndicator }))
);

/**
 * Enhanced PetsScreen with improved component separation and readability
 * Uses custom hooks for navigation and scrolling logic
 * Components are extracted for better maintainability
 */
export default function PetsScreen() {
  const { pets, loadPetsFromStorage, refreshPet, getPetLoadingState, loading } = usePets();
  const navigation = useNavigation<RootStackNavigationProp>();

  // Custom hooks for separated concerns
  const { handleNavigateToWeight, handleNavigateToFoodLog, handleNavigateToAddPet } =
    usePetScreenNavigation(pets);

  const {
    currentPetIndex,
    isScrolling,
    setCurrentPetIndex,
    handleScrollBegin,
    handleHorizontalScroll,
    handleScrollEnd,
    scrollToPet,
  } = usePetScrolling(pets);

  // Refs for component management
  const flatListRef = useRef<FlatList<Pet> | null>(null);
  const scrollViewRefs = useRef<{ [key: string]: ScrollView | null }>({});
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriedLoadingRef = useRef(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized current pet for performance
  const currentPet = useMemo(() => {
    return currentPetIndex >= 0 && currentPetIndex < pets.length ? pets[currentPetIndex] : null;
  }, [pets, currentPetIndex]);

  // Reset loading flag when pets are successfully loaded
  React.useEffect(() => {
    if (pets.length > 0) {
      hasTriedLoadingRef.current = false;
    }
  }, [pets.length]);

  // Screen focus effect for data refresh
  useFocusEffect(
    useCallback(() => {
      info('Pets screen focused', {
        context: {
          screen: 'PetsScreen',
          petCount: pets.length,
          currentPetIndex,
          hasTriedLoading: hasTriedLoadingRef.current,
          isLoading: loading,
          timestamp: new Date().toISOString(),
        },
      });

      // Only refresh if we have no pets and haven't tried loading yet
      if (pets.length === 0 && !hasTriedLoadingRef.current && !loading) {
        hasTriedLoadingRef.current = true;

        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        loadingTimeoutRef.current = setTimeout(() => {
          loadPetsFromStorage().catch(err => {
            error('Failed to load pets from storage', {
              error: err instanceof Error ? err.message : String(err),
            });
            hasTriedLoadingRef.current = false;
          });
        }, 100);
      }
    }, [pets.length, loading, currentPetIndex])
  );

  // Enhanced cleanup for better memory management
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      scrollViewRefs.current = {};
      hasTriedLoadingRef.current = false;

      debug('PetsScreen cleanup completed', {
        context: {
          screen: 'PetsScreen',
          timestamp: new Date().toISOString(),
        },
      });
    };
  }, []);

  // Pet index validation when pets array changes
  React.useEffect(() => {
    const currentLength = pets.length;

    if (currentLength === 0 && currentPetIndex !== -1) {
      setCurrentPetIndex(-1);
    } else if (currentLength > 0 && currentPetIndex === -1) {
      setCurrentPetIndex(0);
    } else if (currentLength > 0 && currentPetIndex >= currentLength) {
      setCurrentPetIndex(Math.max(0, currentLength - 1));
    }
  }, [pets.length, currentPetIndex, setCurrentPetIndex]);

  // Enhanced scroll position reset with debouncing
  React.useEffect(() => {
    if (currentPet && !isScrolling && currentPetIndex >= 0) {
      const scrollViewRef = scrollViewRefs.current[currentPet.id];
      if (scrollViewRef) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          scrollViewRef.scrollTo({ y: 0, animated: true });
        }, 150);
      }
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentPet, isScrolling, currentPetIndex]);

  // Optimized smart refresh function
  const handleRefreshPet = useCallback(
    async (petId: string) => {
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
    [pets, refreshPet, currentPetIndex]
  );

  // Set header options with add button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <PetListHeader onAddPet={handleNavigateToAddPet} loading={loading} />,
    });
  }, [navigation, loading, handleNavigateToAddPet]);

  // Enhanced scroll to pet with improved animation
  const handleScrollToPet = useCallback(
    (index: number) => {
      if (flatListRef.current) {
        scrollToPet(index, flatListRef as React.RefObject<FlatList<Pet>>);

        // Reset the scroll position of the target pet card to top
        const targetPetId = pets[index]?.id;
        if (targetPetId) {
          const scrollViewRef = scrollViewRefs.current[targetPetId];
          if (scrollViewRef) {
            setTimeout(() => {
              scrollViewRef.scrollTo({ y: 0, animated: true });
            }, 450);
          }
        }
      }
    },
    [scrollToPet, pets]
  );

  // Main render with performance optimizations
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState />
          <LoadingOverlay message="Loading your pets..." visible={loading} />
        </View>
      ) : (
        <>
          <PetList
            ref={flatListRef}
            pets={pets}
            currentPetIndex={Math.max(0, currentPetIndex)}
            loading={loading}
            onScroll={handleHorizontalScroll}
            onScrollBegin={handleScrollBegin}
            onScrollEnd={handleScrollEnd}
            onRefreshPet={handleRefreshPet}
            onNavigateToWeight={handleNavigateToWeight}
            onNavigateToFoodLog={handleNavigateToFoodLog}
            getPetLoadingState={getPetLoadingState}
            scrollViewRefs={scrollViewRefs}
          />

          {/* Enhanced Scroll Indicator with loading state */}
          {pets.length > 0 && (
            <Suspense fallback={<ActivityIndicator size="small" color={COLORS.primary} />}>
              <ScrollIndicator
                totalItems={pets.length}
                currentIndex={Math.max(0, currentPetIndex)}
                onDotPress={handleScrollToPet}
              />
            </Suspense>
          )}

          {/* Loading overlay for refresh operations */}
          <LoadingOverlay message="Refreshing..." isGlobal visible={loading && pets.length > 0} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
});
