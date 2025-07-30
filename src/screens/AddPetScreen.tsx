import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { Pet, PetType, PetGender, CoatType } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { formatDateDDMMYYYY, parseDateDDMMYYYY } from '../utils';
import { info, error } from '../utils/logger';

interface PetFormData {
  name: string;
  type: PetType;
  breed: string;
  dateOfBirth: string;
  weight: string;
  color: string;
  gender: PetGender;
  coatType: CoatType;
  microchipId: string;
  ownerNotes: string;
}

const PET_TYPES = [
  { key: PetType.DOG, label: 'Dog', icon: 'paw' as const },
  { key: PetType.CAT, label: 'Cat', icon: 'paw' as const },
];

const GENDER_OPTIONS = [
  { key: PetGender.MALE, label: 'Male', icon: 'man' as const },
  { key: PetGender.FEMALE, label: 'Female', icon: 'woman' as const },
  { key: PetGender.UNKNOWN, label: 'Unknown', icon: 'help' as const },
];

const COAT_TYPES = [
  { key: CoatType.SHORT, label: 'Short' },
  { key: CoatType.MEDIUM, label: 'Medium' },
  { key: CoatType.LONG, label: 'Long' },
  { key: CoatType.CURLY, label: 'Curly' },
  { key: CoatType.WIRE, label: 'Wire' },
  { key: CoatType.HAIRLESS, label: 'Hairless' },
];

export default function AddPetScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { addPet } = usePets();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    type: PetType.DOG,
    breed: '',
    dateOfBirth: '',
    weight: '',
    color: '',
    gender: PetGender.UNKNOWN,
    coatType: CoatType.SHORT,
    microchipId: '',
    ownerNotes: '',
  });

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your pet');
      return;
    }

    if (!formData.breed.trim()) {
      Alert.alert('Error', "Please enter your pet's breed");
      return;
    }

    setLoading(true);

    try {
      // Parse the date from dd-mm-yyyy format if provided
      let dateOfBirth: Date | undefined;
      if (formData.dateOfBirth) {
        const parsedDate = parseDateDDMMYYYY(formData.dateOfBirth);
        dateOfBirth = parsedDate || undefined;
      }

      const newPet: Omit<Pet, 'id'> = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim(),
        dateOfBirth,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        gender: formData.gender,
        microchipId: formData.microchipId.trim() || undefined,
        ownerNotes: formData.ownerNotes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add physical characteristics if coat type is specified
        physicalCharacteristics:
          formData.coatType !== CoatType.SHORT
            ? {
                coatType: formData.coatType,
              }
            : undefined,
      };

      await addPet(newPet);

      info('Pet added successfully', {
        context: {
          screen: 'AddPetScreen',
          petName: newPet.name,
          petType: newPet.type,
        },
      });

      Alert.alert('Success!', `${formData.name} has been added to your pets!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      error('Failed to add pet', {
        error: err instanceof Error ? err.message : String(err),
      });
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateFormData = (
    field: keyof PetFormData,
    value: string | PetType | PetGender | CoatType
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDatePress = () => {
    // If there's already a date entered, use it as the initial value
    if (formData.dateOfBirth) {
      const parsedDate = parseDateDDMMYYYY(formData.dateOfBirth);
      if (parsedDate) {
        setSelectedDate(parsedDate);
      }
    }
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // Format the date for display (dd-mm-yyyy)
      const formattedDate = formatDateDDMMYYYY(date);
      updateFormData('dateOfBirth', formattedDate);
    }
  };

  const handleDatePickerClose = () => {
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pet</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerButton, styles.saveButton]}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Pet Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={value => updateFormData('name', value)}
            placeholder="Enter your pet's name"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Pet Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Pet Type</Text>
          <View style={styles.typeGrid}>
            {PET_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[styles.typeOption, formData.type === type.key && styles.typeOptionSelected]}
                onPress={() => updateFormData('type', type.key)}
              >
                <Ionicons
                  name={type.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={formData.type === type.key ? COLORS.surface : COLORS.text}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    formData.type === type.key && styles.typeOptionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breed */}
        <View style={styles.section}>
          <Text style={styles.label}>Breed *</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={value => updateFormData('breed', value)}
            placeholder="Enter breed (e.g., Golden Retriever, Persian)"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.section}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.hint}>
            If this is a rescue pet or you're unsure, that's okay! A guess will help us out.
          </Text>
          <TouchableOpacity style={styles.dateInput} onPress={handleDatePress}>
            <Text style={[styles.dateInputText, !formData.dateOfBirth && styles.placeholderText]}>
              {formData.dateOfBirth || 'DD-MM-YYYY (tap to select)'}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()} // Can't select future dates
              minimumDate={new Date(1990, 0, 1)} // Reasonable minimum date
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.datePickerButtons}>
              <TouchableOpacity style={styles.datePickerButton} onPress={handleDatePickerClose}>
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerButton} onPress={handleDatePickerClose}>
                <Text style={[styles.datePickerButtonText, styles.datePickerConfirmText]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={value => updateFormData('weight', value)}
            placeholder="Enter current weight"
            placeholderTextColor={COLORS.textLight}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={formData.color}
            onChangeText={value => updateFormData('color', value)}
            placeholder="Enter pet's color (e.g., Brown, Golden, Black & White)"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.typeGrid}>
            {GENDER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.typeOption,
                  formData.gender === option.key && styles.typeOptionSelected,
                ]}
                onPress={() => updateFormData('gender', option.key)}
              >
                <Ionicons
                  name={option.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={formData.gender === option.key ? COLORS.surface : COLORS.text}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    formData.gender === option.key && styles.typeOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coat Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Coat Type</Text>
          <View style={styles.coatTypeGrid}>
            {COAT_TYPES.map(coat => (
              <TouchableOpacity
                key={coat.key}
                style={[
                  styles.coatTypeOption,
                  formData.coatType === coat.key && styles.coatTypeOptionSelected,
                ]}
                onPress={() => updateFormData('coatType', coat.key)}
              >
                <Text
                  style={[
                    styles.coatTypeOptionText,
                    formData.coatType === coat.key && styles.coatTypeOptionTextSelected,
                  ]}
                >
                  {coat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Microchip ID */}
        <View style={styles.section}>
          <Text style={styles.label}>Microchip ID</Text>
          <TextInput
            style={styles.input}
            value={formData.microchipId}
            onChangeText={value => updateFormData('microchipId', value)}
            placeholder="Enter microchip number (if available)"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Owner Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.ownerNotes}
            onChangeText={value => updateFormData('ownerNotes', value)}
            placeholder="Any additional notes about your pet..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    minWidth: 100,
  },
  typeOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  typeOptionTextSelected: {
    color: COLORS.surface,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    minHeight: 48,
  },
  dateInputText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  datePickerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  datePickerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  datePickerConfirmText: {
    fontWeight: '600',
  },
  coatTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  coatTypeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  coatTypeOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  coatTypeOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  coatTypeOptionTextSelected: {
    color: COLORS.surface,
  },
});
