import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, FlatList } from 'react-native';
import { Pet } from '../types';
import { info } from '../utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Custom hook for handling horizontal scrolling logic in PetsScreen
 * Manages scroll state, pagination, and navigation between pets
 */
export const usePetScrolling = (pets: Pet[]) => {
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Refs for scroll management
  const isManualScrollRef = useRef(false);
  const scrollStartXRef = useRef(0);
  const lastScrollDirectionRef = useRef<'left' | 'right' | null>(null);
  const currentPetIndexRef = useRef(currentPetIndex);

  // Keep ref in sync with state
  useEffect(() => {
    currentPetIndexRef.current = currentPetIndex;
  }, [currentPetIndex]);

  // Handle scroll begin to track user interaction
  const handleScrollBegin = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
  }, []);

  // Enhanced horizontal scroll handler with strict page-by-page navigation
  const handleHorizontalScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isManualScrollRef.current || pets.length === 0) {
        return;
      }

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
    [pets]
  );

  // Enhanced scroll end handler with strict adjacent-page enforcement
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isManualScrollRef.current || pets.length === 0) {
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
        targetIndex = Math.min(startIndex + 1, pets.length - 1);
      } else if (proposedIndex < startIndex) {
        targetIndex = Math.max(startIndex - 1, 0);
      } else {
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

      // Reset scrolling state and references
      setTimeout(() => {
        setIsScrolling(false);
        scrollStartXRef.current = targetIndex * SCREEN_WIDTH;
        lastScrollDirectionRef.current = null;
      }, 200);
    },
    [pets]
  );

  // Programmatic scroll to pet
  const scrollToPet = useCallback(
    (index: number, flatListRef: React.RefObject<FlatList<Pet>>) => {
      if (flatListRef.current && pets.length > 0 && index !== currentPetIndexRef.current) {
        const targetIndex = Math.max(0, Math.min(index, pets.length - 1));

        setIsScrolling(true);
        isManualScrollRef.current = true;
        setCurrentPetIndex(targetIndex);

        flatListRef.current.scrollToOffset({
          offset: targetIndex * SCREEN_WIDTH,
          animated: true,
        });

        setTimeout(() => {
          setIsScrolling(false);
          isManualScrollRef.current = false;
        }, 2000);
      }
    },
    [pets.length]
  );

  return {
    currentPetIndex,
    isScrolling,
    setCurrentPetIndex,
    handleScrollBegin,
    handleHorizontalScroll,
    handleScrollEnd,
    scrollToPet,
  };
};
