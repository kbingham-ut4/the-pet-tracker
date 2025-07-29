import React, { useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';
import { usePets } from '../contexts';
import { Pet } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { info, error, debug } from '../utils/logger';
import { EmptyState } from '../components';

// Lazy load components for better performance
const PetCard = lazy(() =>
  import('../components/PetCard').then(module => ({ default: module.PetCard }))
);
const ScrollIndicator = lazy(() =>
  import('../components').then(module => ({ default: module.ScrollIndicator }))
);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Performance-optimized loading fallback
const LoadingFallback = React.memo(() => (
  <View style={styles.loadingFallback}>
    <ActivityIndicator size="small" color={COLORS.primary} />
  </View>
));

LoadingFallback.displayName = 'LoadingFallback';

// Error boundary for pet cards
class PetCardErrorBoundary extends React.Component<
  { children: React.ReactNode; petId: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; petId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(errorObj: Error, errorInfo: React.ErrorInfo) {
    error('Pet card rendering error', {
      context: {
        petId: this.props.petId,
        error: errorObj.message,
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>Unable to load pet card</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function PetsScreen() {
  const { pets, loadPetsFromStorage, refreshPet, getPetLoadingState, loading } = usePets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const flatListRef = useRef<FlatList<Pet>>(null);
  const scrollViewRefs = useRef<{ [key: string]: ScrollView | null }>({});
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualScrollRef = useRef(false);
  const scrollStartXRef = useRef(0);
  const lastScrollDirectionRef = useRef<'left' | 'right' | null>(null);
  const currentPetIndexRef = useRef(currentPetIndex);
  const prevPetsLengthRef = useRef(pets.length);
  const hasTriedLoadingRef = useRef(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized current pet for performance - handle invalid index
  const currentPet = useMemo(() => {
    return currentPetIndex >= 0 && currentPetIndex < pets.length ? pets[currentPetIndex] : null;
  }, [pets, currentPetIndex]);

  // Keep ref in sync with state
  React.useEffect(() => {
    currentPetIndexRef.current = currentPetIndex;
  }, [currentPetIndex]);

  // Reset loading flag when pets are successfully loaded
  React.useEffect(() => {
    if (pets.length > 0) {
      hasTriedLoadingRef.current = false; // Reset for future use
    }
  }, [pets.length]);

  // Screen focus effect for data refresh - prevent infinite loading loops
  useFocusEffect(
    useCallback(() => {
      info('Pets screen focused', {
        context: {
          screen: 'PetsScreen',
          petCount: pets.length,
          currentPetIndex: currentPetIndexRef.current,
          hasTriedLoading: hasTriedLoadingRef.current,
          isLoading: loading,
          timestamp: new Date().toISOString(),
        },
      });

      // Only refresh if we have no pets and haven't tried loading yet
      if (pets.length === 0 && !hasTriedLoadingRef.current && !loading) {
        hasTriedLoadingRef.current = true;

        // Add a small delay to prevent rapid successive calls
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        loadingTimeoutRef.current = setTimeout(() => {
          loadPetsFromStorage().catch(err => {
            error('Failed to load pets from storage', {
              error: err instanceof Error ? err.message : String(err),
            });
            // Reset flag on error so user can retry
            hasTriedLoadingRef.current = false;
          });
        }, 100);
      }
    }, [pets.length, loading]) // Remove loadPetsFromStorage from dependency array to prevent infinite loop
  );

  // Enhanced cleanup for better memory management
  React.useEffect(() => {
    return () => {
      // Clear all timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Clear scroll view refs to prevent memory leaks
      scrollViewRefs.current = {};

      // Reset loading flag on unmount
      hasTriedLoadingRef.current = false;

      debug('PetsScreen cleanup completed', {
        context: {
          screen: 'PetsScreen',
          timestamp: new Date().toISOString(),
        },
      });
    };
  }, []);

  // Optimized pet index validation - handle zero pets case without circular dependency
  React.useEffect(() => {
    const currentLength = pets.length;

    // Update the ref for next time
    prevPetsLengthRef.current = currentLength;

    // Only update state when pets length actually changes or there's a valid reason
    if (currentLength === 0 && currentPetIndexRef.current !== -1) {
      // Reset to -1 when no pets to indicate invalid state
      setCurrentPetIndex(-1);
    } else if (currentLength > 0 && currentPetIndexRef.current === -1) {
      // Reset to 0 when pets are loaded
      setCurrentPetIndex(0);
    } else if (currentLength > 0 && currentPetIndexRef.current >= currentLength) {
      // Clamp to valid range when pets array shrinks
      setCurrentPetIndex(Math.max(0, currentLength - 1));
    }
  }, [pets.length]); // Only depend on pets.length, not currentPetIndex

  // Enhanced scroll position reset with debouncing - only when valid pet exists
  React.useEffect(() => {
    if (currentPet && !isScrolling && currentPetIndex >= 0) {
      const scrollViewRef = scrollViewRefs.current[currentPet.id];
      if (scrollViewRef) {
        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Debounced scroll to top
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

  // Enhanced navigation handlers with loading states
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

  // Optimized smart refresh function
  const handleRefreshPet = useCallback(
    async (petId: string) => {
      const petIndex = pets.findIndex(pet => pet.id === petId);
      const currentIndex = currentPetIndexRef.current;
      const isCurrentlyVisible = petIndex === currentIndex;

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
            currentPetIndex: currentIndex,
            isCurrentlyVisible,
          },
        });
      }
    },
    [pets, refreshPet] // Remove currentPetIndex dependency
  );

  // Set header options with add button only
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={[styles.headerButton, styles.headerRightContainer]}
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
          <View style={[styles.addButtonCircle, loading && styles.disabledButton]}>
            <Ionicons
              name="add"
              size={24}
              color={loading ? COLORS.textSecondary : COLORS.primary}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading]);

  // Enhanced scroll to pet with improved animation and validation
  const scrollToPet = useCallback(
    (index: number) => {
      if (flatListRef.current && pets.length > 0 && index !== currentPetIndexRef.current) {
        // Validate index bounds
        const targetIndex = Math.max(0, Math.min(index, pets.length - 1));

        setIsScrolling(true);
        isManualScrollRef.current = true; // Mark as programmatic scroll
        setCurrentPetIndex(targetIndex);

        // Use scrollToOffset for more precise control
        flatListRef.current.scrollToOffset({
          offset: targetIndex * SCREEN_WIDTH,
          animated: true,
        });

        // Reset scrolling state after animation with validation
        setTimeout(() => {
          setIsScrolling(false);
          isManualScrollRef.current = false;
        }, 2000); // Slightly longer timeout for smooth animation

        // Reset the scroll position of the target pet card to top
        const targetPetId = pets[targetIndex]?.id;
        if (targetPetId) {
          const scrollViewRef = scrollViewRefs.current[targetPetId];
          if (scrollViewRef) {
            setTimeout(() => {
              scrollViewRef.scrollTo({ y: 0, animated: true });
            }, 450); // After FlatList animation completes
          }
        }
      }
    },
    [pets.length]
  );

  // Handle scroll begin to track user interaction
  const handleScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isManualScrollRef.current) {
        return;
      } // Ignore programmatic scrolls

      setIsScrolling(true);
      scrollStartXRef.current = event.nativeEvent.contentOffset.x;
      lastScrollDirectionRef.current = null;

      info('User scroll interaction began', {
        context: {
          screen: 'PetsScreen',
          startOffset: scrollStartXRef.current,
          currentIndex: currentPetIndexRef.current,
        },
      });
    },
    [] // No dependencies needed
  );

  // Enhanced horizontal scroll handler with strict page-by-page navigation
  const handleHorizontalScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isManualScrollRef.current || pets.length === 0) {
        return;
      } // Ignore programmatic scrolls and empty pets

      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const startX = scrollStartXRef.current;
      const currentDirection = contentOffsetX > startX ? 'right' : 'left';
      const currentIndex = currentPetIndexRef.current;

      // Track scroll direction consistency
      if (lastScrollDirectionRef.current === null) {
        lastScrollDirectionRef.current = currentDirection;
      }

      // Calculate current page based on offset
      const currentPage = Math.round(contentOffsetX / SCREEN_WIDTH);
      const validPage = Math.max(0, Math.min(currentPage, pets.length - 1));

      // Only allow movement to adjacent pages
      const maxAllowedIndex =
        currentDirection === 'right'
          ? Math.min(currentIndex + 1, pets.length - 1)
          : Math.max(currentIndex - 1, 0);

      // Constrain to adjacent page movement only
      const constrainedIndex =
        currentDirection === 'right'
          ? Math.min(validPage, maxAllowedIndex)
          : Math.max(validPage, maxAllowedIndex);

      if (
        constrainedIndex !== currentIndex &&
        constrainedIndex >= 0 &&
        constrainedIndex < pets.length
      ) {
        setCurrentPetIndex(constrainedIndex);

        info('Pet card scroll detected - adjacent page only', {
          context: {
            screen: 'PetsScreen',
            previousPetIndex: currentIndex,
            newPetIndex: constrainedIndex,
            direction: currentDirection,
            petId: pets[constrainedIndex]?.id,
            petName: pets[constrainedIndex]?.name,
          },
        });
      }
    },
    [pets] // Only pets as dependency, not currentPetIndex
  );

  // Enhanced scroll end handler with strict adjacent-page enforcement
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isManualScrollRef.current || pets.length === 0) {
        // Reset scrolling state for programmatic scrolls or empty pets
        setTimeout(() => setIsScrolling(false), 150);
        return;
      }

      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const proposedIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
      const startIndex = Math.round(scrollStartXRef.current / SCREEN_WIDTH);
      const currentIndex = currentPetIndexRef.current;

      // Enforce single-page movement only
      let targetIndex: number;
      if (proposedIndex > startIndex) {
        // Moving right - only allow next page
        targetIndex = Math.min(startIndex + 1, pets.length - 1);
      } else if (proposedIndex < startIndex) {
        // Moving left - only allow previous page
        targetIndex = Math.max(startIndex - 1, 0);
      } else {
        // No movement - stay on current page
        targetIndex = startIndex;
      }

      // Ensure bounds
      targetIndex = Math.max(0, Math.min(targetIndex, pets.length - 1));

      // Update state if different
      if (targetIndex !== currentIndex) {
        setCurrentPetIndex(targetIndex);

        info('Scroll end - enforcing single page movement', {
          context: {
            screen: 'PetsScreen',
            startIndex,
            proposedIndex,
            enforcedIndex: targetIndex,
            petId: pets[targetIndex]?.id,
            petName: pets[targetIndex]?.name,
          },
        });
      }

      // Force exact alignment to prevent partial scrolling
      const exactOffset = targetIndex * SCREEN_WIDTH;
      if (Math.abs(contentOffsetX - exactOffset) > 5) {
        // 5px tolerance
        flatListRef.current?.scrollToOffset({
          offset: exactOffset,
          animated: true,
        });

        info('Correcting scroll alignment', {
          context: {
            screen: 'PetsScreen',
            currentOffset: contentOffsetX,
            targetOffset: exactOffset,
            difference: Math.abs(contentOffsetX - exactOffset),
          },
        });
      }

      // Reset scrolling state and references
      setTimeout(() => {
        setIsScrolling(false);
        scrollStartXRef.current = exactOffset;
        lastScrollDirectionRef.current = null;
      }, 200);
    },
    [pets] // Only pets as dependency, not currentPetIndex
  );

  // Ultra-optimized render function with better memoization
  const renderPetCard = useCallback(
    ({ item, index }: { item: Pet; index: number }) => {
      const petLoading = getPetLoadingState(item.id);
      const isCurrentCard = index === currentPetIndexRef.current;

      // Only log for current card in development
      if (__DEV__ && isCurrentCard) {
        info('Rendering current pet card', {
          context: {
            screen: 'PetsScreen',
            petId: item.id,
            petName: item.name,
            index,
            isCurrentCard,
          },
        });
      }

      return (
        <PetCardErrorBoundary key={item.id} petId={item.id}>
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </PetCardErrorBoundary>
      );
    },
    [getPetLoadingState, handleRefreshPet, handleNavigateToWeight, handleNavigateToFoodLog] // Removed currentPetIndex dependency
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: Pet) => item.id, []);

  // Memoized viewable items changed callback
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Pet>[] }) => {
      // Additional logging for viewable items in dev mode
      if (__DEV__ && viewableItems.length > 0) {
        debug('Viewable pets changed', {
          context: {
            viewableCount: viewableItems.length,
            currentPetIds: viewableItems.filter(item => item.item).map(item => item.item.id),
          },
        });
      }
    },
    []
  );

  // Main render with performance optimizations
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Enhanced empty state - no early return to avoid hook order issues */}
      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your pets...</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Enhanced FlatList with better performance settings */}
          <FlatList
            ref={flatListRef}
            data={pets}
            renderItem={renderPetCard}
            keyExtractor={keyExtractor}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={16} // Smoother scroll events
            onScrollBeginDrag={handleScrollBegin} // Track scroll start for adjacent-page enforcement
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            // Ultra-optimized performance settings
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3} // Better balance for smoother scrolling
            removeClippedSubviews={true}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 80,
              minimumViewTime: 150,
            }}
            // Enhanced scroll behavior for precise paging
            bounces={false}
            scrollEnabled={!loading}
            disableIntervalMomentum={true} // Prevent momentum skipping
            decelerationRate="fast" // Faster deceleration for more precise stops
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            // Additional velocity and momentum controls
            overScrollMode="never" // Android: prevent over-scrolling
            directionalLockEnabled={true} // iOS: lock to horizontal scrolling
            alwaysBounceHorizontal={false} // iOS: no horizontal bounce
            bouncesZoom={false} // iOS: no zoom bounce
            // Advanced performance optimizations
            legacyImplementation={false}
            updateCellsBatchingPeriod={50} // Faster updates
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 50,
            }}
            // Memory optimization
            onEndReachedThreshold={0.1}
            onViewableItemsChanged={handleViewableItemsChanged}
          />

          {/* Enhanced Scroll Indicator with loading state - only show when pets exist */}
          {pets.length > 0 && (
            <Suspense fallback={<LoadingFallback />}>
              <ScrollIndicator
                totalItems={pets.length}
                currentIndex={Math.max(0, currentPetIndex)}
                onDotPress={scrollToPet}
              />
            </Suspense>
          )}

          {/* Loading overlay for refresh operations */}
          {loading && pets.length > 0 && (
            <View style={styles.globalLoadingOverlay}>
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.globalLoadingText}>Refreshing...</Text>
              </View>
            </View>
          )}
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  globalLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalLoadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  loadingFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    marginTop: SPACING.sm,
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});
