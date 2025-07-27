import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface CalorieSectionProps {
  todaysCalories: number;
  targetCalories: number;
  calorieProgress: number;
}

const CalorieSection: React.FC<CalorieSectionProps> = ({
  todaysCalories,
  targetCalories,
  calorieProgress,
}) => {
  return (
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
          <Text style={styles.calorieConsumed}>{Math.round(todaysCalories)} cal consumed</Text>
          <Text style={styles.calorieTarget}>{Math.round(targetCalories)} cal target</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calorieSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
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
});

export default CalorieSection;
