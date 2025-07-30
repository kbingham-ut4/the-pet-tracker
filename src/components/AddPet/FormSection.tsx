import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface FormSectionProps {
  children: React.ReactNode;
  label: string;
  hint?: string;
  required?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  label,
  hint,
  required = false,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
});
