import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { useNutrition } from '../hooks';
import { MealType } from '../types';
import { formatDateTime } from '../utils';

type FoodLogRouteProp = RouteProp<{ FoodLog: { petId: string } }, 'FoodLog'>;

export default function FoodLogScreen() {
  const route = useRoute<FoodLogRouteProp>();
  const { petId } = route.params;

  const { pet, foodEntries, dailySummary, logFood, commonFoods } = useNutrition(petId);

  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.BREAKFAST);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  const todayEntries = foodEntries.filter(entry => {
    const today = new Date();
    const entryDate = entry.date;
    return entryDate.toDateString() === today.toDateString();
  });

  const handleAddFood = () => {
    const qty = parseFloat(quantity);
    const calories = customCalories ? parseFloat(customCalories) : undefined;

    if (!foodName.trim()) {
      Alert.alert('Missing Information', 'Please enter a food name.');
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    if (calories !== undefined && (isNaN(calories) || calories < 0)) {
      Alert.alert('Invalid Calories', 'Please enter valid calories.');
      return;
    }

    logFood(foodName, qty, selectedMealType, calories);

    // Reset form
    setFoodName('');
    setQuantity('');
    setCustomCalories('');
    setShowAddFood(false);

    Alert.alert('Success', 'Food entry added successfully!');
  };

  const selectFood = (food: { key: string; name: string; nutrition: Record<string, unknown> }) => {
    setFoodName(food.name);
    setShowFoodPicker(false);
  };

  const renderMealTypeSelector = () => (
    <View style={styles.mealTypeContainer}>
      <Text style={styles.sectionTitle}>Meal Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.values(MealType).map(mealType => (
          <TouchableOpacity
            key={mealType}
            style={[styles.mealTypeChip, selectedMealType === mealType && styles.selectedMealType]}
            onPress={() => setSelectedMealType(mealType)}
          >
            <Text
              style={[
                styles.mealTypeText,
                selectedMealType === mealType && styles.selectedMealTypeText,
              ]}
            >
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFoodInput = () => (
    <View style={styles.inputSection}>
      <Text style={styles.sectionTitle}>Food Details</Text>

      <TouchableOpacity style={styles.foodSelector} onPress={() => setShowFoodPicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Enter food name"
          value={foodName}
          onChangeText={setFoodName}
          editable={false}
        />
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Quantity (grams)"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Custom calories (optional)"
        value={customCalories}
        onChangeText={setCustomCalories}
        keyboardType="numeric"
      />
    </View>
  );

  const renderDailySummary = () => {
    if (!dailySummary) {
      return null;
    }

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Today's Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Calories:</Text>
          <Text style={styles.summaryValue}>{dailySummary.totalCalories}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Protein:</Text>
          <Text style={styles.summaryValue}>{dailySummary.totalProtein.toFixed(1)}g</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fat:</Text>
          <Text style={styles.summaryValue}>{dailySummary.totalFat.toFixed(1)}g</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Carbs:</Text>
          <Text style={styles.summaryValue}>{dailySummary.totalCarbs.toFixed(1)}g</Text>
        </View>

        {dailySummary.calorieGoal > 0 && (
          <View style={[styles.summaryRow, { marginTop: SPACING.sm }]}>
            <Text style={styles.summaryLabel}>Remaining:</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: dailySummary.remainingCalories < 0 ? COLORS.warning : COLORS.success },
              ]}
            >
              {dailySummary.remainingCalories} cal
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFoodEntries = () => (
    <View style={styles.entriesSection}>
      <Text style={styles.sectionTitle}>Today's Food Log</Text>

      {todayEntries.length === 0 ? (
        <Text style={styles.emptyText}>No food entries for today</Text>
      ) : (
        <FlatList
          data={todayEntries.sort((a, b) => b.date.getTime() - a.date.getTime())}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryFood}>{item.foodName}</Text>
                <Text style={styles.entryCalories}>{item.calories} cal</Text>
              </View>

              <View style={styles.entryDetails}>
                <Text style={styles.entryMeal}>
                  {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
                </Text>
                <Text style={styles.entryQuantity}>{item.quantity}g</Text>
                <Text style={styles.entryTime}>{formatDateTime(item.date).split(',')[1]}</Text>
              </View>

              {(item.protein || item.fat || item.carbs) && (
                <View style={styles.nutritionRow}>
                  {item.protein && (
                    <Text style={styles.nutritionText}>P: {item.protein.toFixed(1)}g</Text>
                  )}
                  {item.fat && <Text style={styles.nutritionText}>F: {item.fat.toFixed(1)}g</Text>}
                  {item.carbs && (
                    <Text style={styles.nutritionText}>C: {item.carbs.toFixed(1)}g</Text>
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );

  const renderFoodPickerModal = () => (
    <Modal visible={showFoodPicker} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Food</Text>
          <TouchableOpacity onPress={() => setShowFoodPicker(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={commonFoods}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.foodItem} onPress={() => selectFood(item)}>
              <Text style={styles.foodItemName}>{item.name}</Text>
              <Text style={styles.foodItemCalories}>{item.nutrition.calories} cal/100g</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{pet.name}'s Food Log</Text>

        {renderDailySummary()}
        {renderFoodEntries()}

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddFood(true)}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Add Food</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={showAddFood} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Food Entry</Text>
            <TouchableOpacity onPress={() => setShowAddFood(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderMealTypeSelector()}
            {renderFoodInput()}

            <TouchableOpacity style={styles.saveButton} onPress={handleAddFood}>
              <Text style={styles.saveButtonText}>Save Food Entry</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {renderFoodPickerModal()}
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  entriesSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: SPACING.lg,
  },
  entryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  entryFood: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  entryCalories: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  entryMeal: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  entryQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  entryTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nutritionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  mealTypeContainer: {
    marginBottom: SPACING.lg,
  },
  mealTypeChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  selectedMealType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  selectedMealTypeText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  foodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    paddingRight: SPACING.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    borderWidth: 0,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodItemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  foodItemCalories: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
