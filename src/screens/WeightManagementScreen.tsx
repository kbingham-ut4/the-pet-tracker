import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { useNutrition } from '../hooks';
import { ActivityLevel, WeightGoal } from '../types';
import { formatDate } from '../utils';

type WeightManagementRouteProp = RouteProp<
  { WeightManagement: { petId: string } },
  'WeightManagement'
>;

export default function WeightManagementScreen() {
  const route = useRoute<WeightManagementRouteProp>();
  const _navigation = useNavigation();
  const { petId } = route.params;

  const {
    pet,
    weightRecords,
    calorieTarget,
    nutritionProfile,
    dailySummary,
    recommendedCalories,
    logWeight,
    updateCalorieGoal,
    updateNutritionProfile,
    getWeightTrend,
    calculateWeightLossPlan: _calculateWeightLossPlan,
    isCalorieTrackingSupported,
  } = useNutrition(petId);

  const [newWeight, setNewWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState(calorieTarget?.targetWeight?.toString() || '');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<WeightGoal>(
    calorieTarget?.weightGoal || WeightGoal.MAINTAIN
  );

  const currentWeight =
    weightRecords.length > 0
      ? [...weightRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0].weight
      : pet?.weight || 0;

  const weightTrend = getWeightTrend();

  const handleLogWeight = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    logWeight(weight);
    setNewWeight('');
    setShowWeightInput(false);
    Alert.alert('Success', 'Weight recorded successfully!');
  };

  const handleSetTarget = () => {
    const target = parseFloat(targetWeight);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target weight.');
      return;
    }

    const currentCalories = calorieTarget?.dailyCalorieGoal || recommendedCalories || 0;
    updateCalorieGoal(currentCalories, selectedGoal, target);
    Alert.alert('Success', 'Weight goal updated successfully!');
  };

  const setupNutritionProfile = () => {
    if (!nutritionProfile) {
      updateNutritionProfile(ActivityLevel.MODERATELY_ACTIVE, false);
    }
  };

  const renderWeightCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current Weight</Text>
      <Text style={styles.weightValue}>{currentWeight.toFixed(1)} kg</Text>

      {weightTrend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={
              weightTrend.trend === 'increasing'
                ? 'trending-up'
                : weightTrend.trend === 'decreasing'
                  ? 'trending-down'
                  : 'remove'
            }
            size={20}
            color={
              weightTrend.trend === 'increasing'
                ? COLORS.warning
                : weightTrend.trend === 'decreasing'
                  ? COLORS.success
                  : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.trendText,
              {
                color:
                  weightTrend.trend === 'increasing'
                    ? COLORS.warning
                    : weightTrend.trend === 'decreasing'
                      ? COLORS.success
                      : COLORS.textSecondary,
              },
            ]}
          >
            {Math.abs(weightTrend.change)} kg ({Math.abs(weightTrend.changePercentage).toFixed(1)}%)
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => setShowWeightInput(!showWeightInput)}>
        <Text style={styles.buttonText}>Log Weight</Text>
      </TouchableOpacity>

      {showWeightInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter weight (kg)"
            value={newWeight}
            onChangeText={setNewWeight}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleLogWeight}>
            <Text style={styles.submitButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCalorieCard = () => {
    if (!isCalorieTrackingSupported) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calorie Tracking</Text>
          <Text style={styles.unavailableText}>
            Calorie tracking is currently only available for dogs.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Calories</Text>

        {dailySummary ? (
          <>
            <View style={styles.calorieProgress}>
              <Text style={styles.calorieValue}>
                {dailySummary.totalCalories} / {dailySummary.calorieGoal}
              </Text>
              <Text style={styles.calorieLabel}>calories today</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((dailySummary.totalCalories / dailySummary.calorieGoal) * 100, 100)}%`,
                    backgroundColor:
                      dailySummary.remainingCalories < 0 ? COLORS.warning : COLORS.primary,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.remainingText,
                {
                  color: dailySummary.remainingCalories < 0 ? COLORS.warning : COLORS.success,
                },
              ]}
            >
              {dailySummary.remainingCalories >= 0
                ? `${dailySummary.remainingCalories} calories remaining`
                : `${Math.abs(dailySummary.remainingCalories)} calories over`}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.recommendedText}>
              Recommended: {recommendedCalories || 'Set up profile'} calories/day
            </Text>
            {!nutritionProfile && (
              <TouchableOpacity style={styles.button} onPress={setupNutritionProfile}>
                <Text style={styles.buttonText}>Set Up Profile</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const renderGoalCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Weight Goal</Text>

      <View style={styles.goalSelector}>
        {Object.values(WeightGoal).map(goal => (
          <TouchableOpacity
            key={goal}
            style={[styles.goalOption, selectedGoal === goal && styles.selectedGoal]}
            onPress={() => setSelectedGoal(goal)}
          >
            <Text style={[styles.goalText, selectedGoal === goal && styles.selectedGoalText]}>
              {goal.charAt(0).toUpperCase() + goal.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedGoal !== WeightGoal.MAINTAIN && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Target weight (kg)"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
          />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSetTarget}>
        <Text style={styles.buttonText}>Update Goal</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWeightHistory = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Weight History</Text>

      {weightRecords.length === 0 ? (
        <Text style={styles.emptyText}>No weight records yet</Text>
      ) : (
        <ScrollView style={styles.historyList}>
          {[...weightRecords]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 10)
            .map(record => (
              <View key={record.id} style={styles.historyItem}>
                <Text style={styles.historyWeight}>{record.weight.toFixed(1)} kg</Text>
                <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );

  if (!pet) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{pet.name}'s Weight Management</Text>

        {renderWeightCard()}
        {renderCalorieCard()}
        {renderGoalCard()}
        {renderWeightHistory()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  weightValue: {
    fontSize: FONT_SIZES.largeTitle,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  trendText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  calorieProgress: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calorieValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calorieLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  remainingText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  recommendedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  goalSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  goalOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  selectedGoal: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  selectedGoalText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyWeight: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unavailableText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
