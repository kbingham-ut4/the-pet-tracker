import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface CoatTypeOption {
  key: string;
  label: string;
}

interface CoatTypeSelectorProps {
  options: CoatTypeOption[];
  selectedValue: string;
  onSelect: (_selectedValue: string) => void;
}

export const CoatTypeSelector: React.FC<CoatTypeSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.grid}>
      {options.map(option => (
        <TouchableOpacity
          key={option.key}
          style={[styles.option, selectedValue === option.key && styles.optionSelected]}
          onPress={() => onSelect(option.key)}
        >
          <Text
            style={[styles.optionText, selectedValue === option.key && styles.optionTextSelected]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.surface,
  },
});
