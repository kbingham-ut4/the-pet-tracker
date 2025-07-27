import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface ScrollIndicatorProps {
  totalItems: number;
  currentIndex: number;
  onDotPress: (_index: number) => void;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  totalItems,
  currentIndex,
  onDotPress,
}) => {
  if (totalItems <= 1) {
    return null;
  }

  return (
    <View style={styles.scrollIndicator}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalItems }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.indicatorDot, index === currentIndex && styles.indicatorDotActive]}
            onPress={() => onDotPress(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  indicatorDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 8,
    borderRadius: 4,
  },
});

export default ScrollIndicator;
