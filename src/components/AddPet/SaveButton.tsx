import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface SaveButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onPress, loading = false }) => {
  return (
    <TouchableOpacity
      style={[styles.saveButton, loading && styles.disabledButton]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} size="small" />
      ) : (
        <Text style={styles.saveButtonText}>Save Pet</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
