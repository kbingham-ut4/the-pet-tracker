import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface TextInputFieldProps extends TextInputProps {
  value: string;
  onChangeText: (_text: string) => void;
  isTextArea?: boolean;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  value,
  onChangeText,
  isTextArea = false,
  placeholder,
  keyboardType,
  ...props
}) => {
  return (
    <TextInput
      style={[styles.input, isTextArea && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      keyboardType={keyboardType}
      multiline={isTextArea}
      numberOfLines={isTextArea ? 3 : 1}
      textAlignVertical={isTextArea ? 'top' : 'center'}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
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
});
