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
      {Array.from({ length: totalItems }).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.indicatorDot, index === currentIndex && styles.indicatorDotActive]}
          onPress={() => onDotPress(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
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
