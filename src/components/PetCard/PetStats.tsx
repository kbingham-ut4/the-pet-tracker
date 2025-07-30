import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { IPet } from '../../interfaces';
import { formatDateDDMMYYYY } from '../../utils';

interface PetStatsProps {
  pet: IPet;
}

/**
 * Formats pet age for display
 * Shows only years when pet is 1 year or older for better text fitting
 */
const formatPetAge = (age: IPet['age']): string => {
  if (!age) {
    return 'Age unknown';
  }

  if (age.years === 0) {
    return age.months === 1 ? '1 month' : `${age.months} months`;
  } else {
    // For pets 1 year or older, only show years
    return age.years === 1 ? '1 year' : `${age.years} years`;
  }
};

const PetStats: React.FC<PetStatsProps> = ({ pet }) => {
  // Use the age from storage (already calculated by PetStorageService)
  const ageText = formatPetAge(pet.age);

  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Pet Information</Text>

      <View style={styles.statsGrid}>
        {pet.weight && (
          <View style={styles.statCard}>
            <Ionicons name="scale" size={20} color={COLORS.accent} />
            <Text style={styles.statValue}>{pet.weight} kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
        )}

        {pet.age && (
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={20} color={COLORS.secondary} />
            <Text style={styles.statValue}>{ageText}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
        )}

        {pet.dateOfBirth && (
          <View style={styles.statCard}>
            <Ionicons name="gift" size={20} color={COLORS.info} />
            <Text style={styles.statValue}>{formatDateDDMMYYYY(pet.dateOfBirth)}</Text>
            <Text style={styles.statLabel}>Date of Birth</Text>
          </View>
        )}

        {pet.color && (
          <View style={styles.statCard}>
            <Ionicons name="color-palette" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{pet.color}</Text>
            <Text style={styles.statLabel}>Color</Text>
          </View>
        )}

        {pet.gender && (
          <View style={styles.statCard}>
            <Ionicons
              name={pet.gender === 'male' ? 'man' : pet.gender === 'female' ? 'woman' : 'help'}
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.statValue}>{pet.gender}</Text>
            <Text style={styles.statLabel}>Gender</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default PetStats;
