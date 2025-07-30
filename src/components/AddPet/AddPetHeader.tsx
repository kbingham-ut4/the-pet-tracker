import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface AddPetHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  loading?: boolean;
}

export const AddPetHeader: React.FC<AddPetHeaderProps> = ({
  onCancel,
  onSave,
  loading = false,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
        <Ionicons name="close" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add Pet</Text>
      <TouchableOpacity
        onPress={onSave}
        style={[styles.headerButton, styles.saveButton]}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
