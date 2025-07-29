import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

interface LoadingOverlayProps {
  message?: string;
  isGlobal?: boolean;
  visible?: boolean;
}

/**
 * Reusable loading overlay component with customizable styling
 * Supports both local and global overlay modes
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  isGlobal = false,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.overlay, isGlobal ? styles.globalOverlay : styles.localOverlay]}>
      <View style={[styles.content, isGlobal && styles.globalContent]}>
        <ActivityIndicator size={isGlobal ? 'large' : 'small'} color={COLORS.primary} />
        <Text style={[styles.text, isGlobal && styles.globalText]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  localOverlay: {
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
  },
  globalOverlay: {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  },
  content: {
    alignItems: 'center',
  },
  globalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  globalText: {
    marginTop: 0,
    marginLeft: SPACING.sm,
  },
});
