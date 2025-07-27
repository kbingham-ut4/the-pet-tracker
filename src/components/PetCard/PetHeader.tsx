import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Pet } from '../../types';

interface PetHeaderProps {
  pet: Pet;
}

const PetHeader: React.FC<PetHeaderProps> = ({ pet }) => {
  return (
    <View style={styles.petHeader}>
      <View
        style={[
          styles.petTypeIcon,
          { backgroundColor: COLORS.petColors[pet.type] || COLORS.petColors.other },
        ]}
      >
        <Ionicons name="paw" size={32} color={COLORS.surface} />
      </View>
      <View style={styles.petHeaderInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petDetails}>
          {pet.breed} • {pet.age ? `${pet.age} years old` : 'Age unknown'}
        </Text>
        <Text style={styles.petType}>{pet.type}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  petTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  petHeaderInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  petDetails: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
});

export default PetHeader;
