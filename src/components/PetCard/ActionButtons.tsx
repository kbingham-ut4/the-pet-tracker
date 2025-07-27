import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface ActionButtonsProps {
  petId: string;
  onNavigateToWeight: (_petId: string) => void;
  onNavigateToFoodLog: (_petId: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  petId,
  onNavigateToWeight,
  onNavigateToFoodLog,
}) => {
  return (
    <View style={styles.actionSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigateToWeight(petId)}>
          <Ionicons name="fitness" size={20} color={COLORS.surface} />
          <Text style={styles.actionButtonText}>Weight Management</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigateToFoodLog(petId)}>
          <Ionicons name="restaurant" size={20} color={COLORS.surface} />
          <Text style={styles.actionButtonText}>Food Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionButtons: {
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.surface,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
});

export default ActionButtons;
