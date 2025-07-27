import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="paw-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyStateTitle}>No pets added yet</Text>
      <Text style={styles.emptyStateText}>
        Tap the + button to add your first furry, feathered, or scaly friend!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
