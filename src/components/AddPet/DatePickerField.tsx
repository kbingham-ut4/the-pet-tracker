import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface DatePickerFieldProps {
  value: string;
  selectedDate: Date;
  showPicker: boolean;
  onPress: () => void;
  onDateChange: (_event: DateTimePickerEvent, _date?: Date) => void;
  onClose: () => void;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  selectedDate,
  showPicker,
  onPress,
  onDateChange,
  onClose,
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.dateInput} onPress={onPress}>
        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
          {value || '15-03-2020 (tap to select)'}
        </Text>
        <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Can't select future dates
          minimumDate={new Date(1990, 0, 1)} // Reasonable minimum date
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.datePickerButtons}>
          <TouchableOpacity style={styles.datePickerButton} onPress={onClose}>
            <Text style={styles.datePickerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.datePickerButton} onPress={onClose}>
            <Text style={[styles.datePickerButtonText, styles.datePickerConfirmText]}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
