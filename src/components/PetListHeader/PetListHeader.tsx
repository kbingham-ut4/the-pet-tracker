import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface PetListHeaderProps {
  onAddPet: () => void;
  loading?: boolean;
}

/**
 * Header component for PetsScreen with add pet functionality
 * Provides a clean, reusable header with consistent styling
 */
export const PetListHeader: React.FC<PetListHeaderProps> = ({ onAddPet, loading = false }) => {
  return (
    <TouchableOpacity
      style={[styles.headerButton, styles.headerRightContainer]}
      onPress={onAddPet}
      disabled={loading}
      accessibilityLabel="Add new pet"
      accessibilityHint="Navigate to add pet screen"
    >
      <View style={[styles.addButtonCircle, loading && styles.disabledButton]}>
        <Ionicons name="add" size={24} color={loading ? COLORS.textSecondary : COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
