import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING } from '../constants';
import { usePets } from '../contexts';
import { Pet, PetType, PetSex, CoatType } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { parseDateDDMMYYYY } from '../utils';
import { info, error } from '../logger';
import {
  AddPetHeader,
  FormSection,
  TextInputField,
  SelectionGrid,
  CoatTypeSelector,
  DatePickerField,
  FormCard,
  SaveButton,
} from '../components/AddPet';

interface PetFormData {
  name: string;
  type: PetType;
  breed: string;
  dateOfBirth: string;
  weight: string;
  color: string;
  sex: PetSex;
  coatType: CoatType;
  microchipId: string;
  ownerNotes: string;
}

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
    sex: PetSex.MALE,
    coatType: CoatType.SHORT,
    microchipId: '',
    ownerNotes: '',
  });

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Pet name is required.');
      return;
    }

    if (!formData.breed.trim()) {
      Alert.alert('Validation Error', 'Pet breed is required.');
      return;
    }

    if (!formData.dateOfBirth) {
      Alert.alert('Validation Error', 'Date of birth is required.');
      return;
    }

    if (!formData.weight.trim()) {
      Alert.alert('Validation Error', 'Weight is required.');
      return;
    }

    if (formData.weight && isNaN(parseFloat(formData.weight))) {
      Alert.alert('Validation Error', 'Please enter a valid weight.');
      return;
    }

    setLoading(true);

    try {
      const petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim(),
        dateOfBirth: parseDateDDMMYYYY(formData.dateOfBirth)!,
        weight: parseFloat(formData.weight),
        color: formData.color.trim() || undefined,
        sex: formData.sex,
        microchipId: formData.microchipId.trim() || undefined,
        ownerNotes: formData.ownerNotes.trim() || undefined,
        physicalCharacteristics: {
          coatType: formData.coatType,
        },
      };

      await addPet(petData);

      info('Pet added successfully', {
        petName: petData.name,
        petType: petData.type,
      });

      navigation.goBack();
    } catch (err) {
      error('Failed to add pet', { error: err });
      Alert.alert('Error', 'Failed to add pet. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (
    field: keyof PetFormData,
    value: string | PetType | PetSex | CoatType
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDatePickerPress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;
      updateFormData('dateOfBirth', formattedDate);
    }
  };

  const handleDatePickerClose = () => {
    setShowDatePicker(false);
  };

  // Constants for the selection options
  const PET_TYPES = [
    { key: PetType.DOG, label: 'Dog', icon: 'paw' },
    { key: PetType.CAT, label: 'Cat', icon: 'paw' },
  ];

  const SEX_OPTIONS = [
    { key: PetSex.MALE, label: 'Male', icon: 'man' },
    { key: PetSex.FEMALE, label: 'Female', icon: 'woman' },
  ];

  const COAT_TYPES = [
    { key: CoatType.SHORT, label: 'Short' },
    { key: CoatType.MEDIUM, label: 'Medium' },
    { key: CoatType.LONG, label: 'Long' },
    { key: CoatType.CURLY, label: 'Curly' },
    { key: CoatType.WIRE, label: 'Wire' },
    { key: CoatType.HAIRLESS, label: 'Hairless' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AddPetHeader onCancel={handleCancel} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FormCard title="Basic Information">
          <FormSection label="Pet Name" required hint="Enter your pet's name">
            <TextInputField
              value={formData.name}
              onChangeText={value => updateFormData('name', value)}
              placeholder="e.g., Buddy"
            />
          </FormSection>

          <FormSection label="Pet Type" required>
            <SelectionGrid
              options={PET_TYPES}
              selectedValue={formData.type}
              onSelect={value => updateFormData('type', value as PetType)}
            />
          </FormSection>

          <FormSection label="Breed" required hint="Enter breed (e.g., Golden Retriever, Persian)">
            <TextInputField
              value={formData.breed}
              onChangeText={value => updateFormData('breed', value)}
              placeholder="e.g., Labrador Retriever"
            />
          </FormSection>

          <FormSection label="Sex" required>
            <SelectionGrid
              options={SEX_OPTIONS}
              selectedValue={formData.sex}
              onSelect={value => updateFormData('sex', value as PetSex)}
            />
          </FormSection>
        </FormCard>

        <FormCard title="Physical Characteristics">
          <FormSection
            label="Date of Birth"
            required
            hint="If this is a rescue pet or you're unsure, that's okay! A guess will help us out."
          >
            <DatePickerField
              value={formData.dateOfBirth}
              selectedDate={selectedDate}
              showPicker={showDatePicker}
              onPress={handleDatePickerPress}
              onDateChange={handleDateChange}
              onClose={handleDatePickerClose}
            />
          </FormSection>

          <FormSection label="Weight (kg)" required hint="Enter current weight">
            <TextInputField
              value={formData.weight}
              onChangeText={value => updateFormData('weight', value)}
              placeholder="e.g., 25.5"
              keyboardType="decimal-pad"
            />
          </FormSection>

          <FormSection label="Color" hint="Enter pet's color (e.g., Brown, Golden, Black & White)">
            <TextInputField
              value={formData.color}
              onChangeText={value => updateFormData('color', value)}
              placeholder="e.g., Golden Brown"
            />
          </FormSection>

          <FormSection label="Coat Type">
            <CoatTypeSelector
              options={COAT_TYPES}
              selectedValue={formData.coatType}
              onSelect={value => updateFormData('coatType', value as CoatType)}
            />
          </FormSection>
        </FormCard>

        <FormCard title="Additional Information">
          <FormSection label="Microchip ID" hint="Enter microchip number (if available)">
            <TextInputField
              value={formData.microchipId}
              onChangeText={value => updateFormData('microchipId', value)}
              placeholder="e.g., 982000000123456"
            />
          </FormSection>

          <FormSection label="Notes" hint="Any additional notes about your pet...">
            <TextInputField
              value={formData.ownerNotes}
              onChangeText={value => updateFormData('ownerNotes', value)}
              placeholder="e.g., Loves playing fetch, allergic to chicken"
              isTextArea
            />
          </FormSection>
        </FormCard>
      </ScrollView>

      <SaveButton onPress={handleSave} loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
});
