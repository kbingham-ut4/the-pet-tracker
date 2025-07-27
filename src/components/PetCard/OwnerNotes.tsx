import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface OwnerNotesProps {
  notes: string;
}

const OwnerNotes: React.FC<OwnerNotesProps> = ({ notes }) => {
  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Notes</Text>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
});

export default OwnerNotes;
