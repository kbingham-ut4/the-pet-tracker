import React, { useCallback, Suspense } from 'react';
import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  View,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Pet } from '../../types';
import { PetCard } from '../PetCard';
import { COLORS } from '../../constants';
import { info, debug } from '../../utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Performance-optimized loading fallback
const LoadingFallback = React.memo(() => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
    console.error('Pet card rendering error', {
      petId: this.props.petId,
      error: errorObj.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    return this.props.children;
  }
}

interface PetListProps {
  pets: Pet[];
  currentPetIndex: number;
  loading: boolean;
  onScroll: (_event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBegin: (_event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEnd: (_event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onRefreshPet: (_petId: string) => Promise<void>;
  onNavigateToWeight: (_petId: string) => void;
  onNavigateToFoodLog: (_petId: string) => void;
  getPetLoadingState: (_petId: string) => boolean;
  scrollViewRefs: React.MutableRefObject<{ [key: string]: unknown }>;
}

/**
 * Optimized PetList component that handles the FlatList and pet card rendering
 * Separated from main screen for better maintainability and testing
 */
export const PetList = React.forwardRef<FlatList<Pet>, PetListProps>(
  (
    {
      pets,
      currentPetIndex,
      loading,
      onScroll,
      onScrollBegin,
      onScrollEnd,
      onRefreshPet,
      onNavigateToWeight,
      onNavigateToFoodLog,
      getPetLoadingState,
      scrollViewRefs,
    },
    ref
  ) => {
    // Ultra-optimized render function with better memoization
    const renderPetCard = useCallback(
      ({ item, index }: { item: Pet; index: number }) => {
        const petLoading = getPetLoadingState(item.id);
        const isCurrentCard = index === currentPetIndex;

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
                onRefresh={onRefreshPet}
                onNavigateToWeight={onNavigateToWeight}
                onNavigateToFoodLog={onNavigateToFoodLog}
              />
            </Suspense>
          </PetCardErrorBoundary>
        );
      },
      [
        currentPetIndex,
        getPetLoadingState,
        onRefreshPet,
        onNavigateToWeight,
        onNavigateToFoodLog,
        scrollViewRefs,
      ]
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

    return (
      <FlatList
        ref={ref}
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBegin}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        // Ultra-optimized performance settings
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
          minimumViewTime: 150,
        }}
        // Enhanced scroll behavior for precise paging
        bounces={false}
        scrollEnabled={!loading}
        disableIntervalMomentum={true}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        // Additional velocity and momentum controls
        overScrollMode="never"
        directionalLockEnabled={true}
        alwaysBounceHorizontal={false}
        bouncesZoom={false}
        // Advanced performance optimizations
        legacyImplementation={false}
        updateCellsBatchingPeriod={50}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 50,
        }}
        // Memory optimization
        onEndReachedThreshold={0.1}
        onViewableItemsChanged={handleViewableItemsChanged}
      />
    );
  }
);

PetList.displayName = 'PetList';
