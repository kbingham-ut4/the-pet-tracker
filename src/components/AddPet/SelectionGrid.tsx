import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface SelectionOption {
  key: string;
  label: string;
  icon?: string;
}

interface SelectionGridProps {
  options: SelectionOption[];
  selectedValue: string;
  onSelect: (_selectedValue: string) => void;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
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
          {option.icon && (
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={selectedValue === option.key ? COLORS.surface : COLORS.text}
            />
          )}
          <Text
            style={[
              styles.optionText,
              selectedValue === option.key && styles.optionTextSelected,
              option.icon && styles.optionTextWithIcon,
            ]}
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
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  optionTextWithIcon: {
    marginLeft: SPACING.xs,
  },
  optionTextSelected: {
    color: COLORS.surface,
  },
});
