import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { usePets } from '../contexts';
import { Pet, PetType } from '../types';
import { RootStackNavigationProp } from '../types/Navigation';
import { info, error } from '../utils/logging';

interface PetFormData {
  name: string;
  type: PetType;
  breed: string;
  age: string;
  weight: string;
  ownerNotes: string;
}

const PET_TYPES = [
  { key: PetType.DOG, label: 'Dog', icon: 'paw' },
  { key: PetType.CAT, label: 'Cat', icon: 'paw' },
  { key: PetType.BIRD, label: 'Bird', icon: 'airplane' },
  { key: PetType.FISH, label: 'Fish', icon: 'fish' },
  { key: PetType.RABBIT, label: 'Rabbit', icon: 'leaf' },
  { key: PetType.OTHER, label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function AddPetScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { addPet } = usePets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    type: PetType.DOG,
    breed: '',
    age: '',
    weight: '',
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
      const newPet: Omit<Pet, 'id'> = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim(),
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        ownerNotes: formData.ownerNotes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      error('Failed to add pet', err);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateFormData = (field: keyof PetFormData, value: string | PetType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

        {/* Age */}
        <View style={styles.section}>
          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={value => updateFormData('age', value)}
            placeholder="Enter age in years"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={value => updateFormData('weight', value)}
            placeholder="Enter current weight"
            placeholderTextColor={COLORS.textLight}
            keyboardType="decimal-pad"
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
});
