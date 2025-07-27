import React, { forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Pet, PetType } from '../../types';
import { debug } from '../../utils/logging';
import { usePetCalories } from '../../hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PetCardProps {
  pet: Pet;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onNavigateToWeight: (_petId: string) => void;
  onNavigateToFoodLog: (_petId: string) => void;
}

const PetCard = forwardRef<ScrollView, PetCardProps>(
  ({ pet, loading, onRefresh, onNavigateToWeight, onNavigateToFoodLog }, ref) => {
    debug('Rendering pet card', { context: { petId: pet.id, petName: pet.name } });

    const { todaysCalories, targetCalories } = usePetCalories(pet);
    const calorieProgress = targetCalories > 0 ? (todaysCalories / targetCalories) * 100 : 0;

    return (
      <View style={styles.petCard}>
        <ScrollView
          ref={ref}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Pet Header */}
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

          {/* Calorie Section */}
          <View style={styles.calorieSection}>
            <Text style={styles.sectionTitle}>Daily Nutrition</Text>

            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <Text style={styles.calorieTitle}>Calories Today</Text>
                <Text style={styles.caloriePercentage}>{Math.round(calorieProgress)}%</Text>
              </View>

              <View style={styles.calorieProgressContainer}>
                <View style={styles.calorieProgressBackground}>
                  <View
                    style={[
                      styles.calorieProgressBar,
                      {
                        width: `${Math.min(calorieProgress, 100)}%`,
                        backgroundColor:
                          calorieProgress > 100
                            ? COLORS.warning
                            : calorieProgress > 80
                              ? COLORS.success
                              : COLORS.accent,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.calorieNumbers}>
                <Text style={styles.calorieConsumed}>
                  {Math.round(todaysCalories)} cal consumed
                </Text>
                <Text style={styles.calorieTarget}>{Math.round(targetCalories)} cal target</Text>
              </View>
            </View>
          </View>

          {/* Pet Stats */}
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
                  <Text style={styles.statValue}>{pet.age} years</Text>
                  <Text style={styles.statLabel}>Age</Text>
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
                    name={
                      pet.gender === 'male' ? 'male' : pet.gender === 'female' ? 'female' : 'help'
                    }
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.statValue}>{pet.gender}</Text>
                  <Text style={styles.statLabel}>Gender</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {pet.type === PetType.DOG && (
            <View style={styles.actionSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onNavigateToWeight(pet.id)}
                >
                  <Ionicons name="fitness" size={20} color={COLORS.surface} />
                  <Text style={styles.actionButtonText}>Weight Management</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onNavigateToFoodLog(pet.id)}
                >
                  <Ionicons name="restaurant" size={20} color={COLORS.surface} />
                  <Text style={styles.actionButtonText}>Food Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Owner Notes */}
          {pet.ownerNotes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{pet.ownerNotes}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
);

PetCard.displayName = 'PetCard';

const styles = StyleSheet.create({
  petCard: {
    width: SCREEN_WIDTH,
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cardContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  calorieSection: {
    marginBottom: SPACING.lg,
  },
  calorieCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calorieTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  caloriePercentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  calorieProgressContainer: {
    marginBottom: SPACING.md,
  },
  calorieProgressBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  calorieProgressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  calorieNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieConsumed: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  calorieTarget: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  statsSection: {
    marginBottom: SPACING.lg,
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
  actionSection: {
    marginBottom: SPACING.lg,
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
  notesSection: {
    marginBottom: SPACING.lg,
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

export default PetCard;
