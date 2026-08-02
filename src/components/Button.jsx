import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/** @typedef {import('react-native').StyleProp<import('react-native').ViewStyle>} StyleProp */

const VARIANTS = {
  primary: { bg: '#16a34a', border: '#16a34a', text: '#ffffff' },
  secondary: { bg: '#dcfce7', border: '#bbf7d0', text: '#15803d' },
  outline: { bg: 'transparent', border: '#16a34a', text: '#16a34a' },
  ghost: { bg: 'transparent', border: 'transparent', text: '#16a34a' },
  danger: { bg: '#dc2626', border: '#dc2626', text: '#ffffff' },
  success: { bg: '#059669', border: '#059669', text: '#ffffff' },
  warning: { bg: '#d97706', border: '#d97706', text: '#ffffff' },
};

const SIZES = {
  xs: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12, icon: 14 },
  sm: { paddingVertical: 9, paddingHorizontal: 16, fontSize: 14, icon: 16 },
  md: { paddingVertical: 13, paddingHorizontal: 20, fontSize: 15, icon: 18 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16, icon: 20 },
  xl: { paddingVertical: 18, paddingHorizontal: 28, fontSize: 18, icon: 22 },
};

/**
 * @param {{
 *   title: string;
 *   onPress?: () => void;
 *   variant?: string;
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
 *   isLoading?: boolean;
 *   disabled?: boolean;
 *   fullWidth?: boolean;
 *   style?: StyleProp;
 *   textStyle?: StyleProp;
 *   leftIcon?: string | React.ReactNode;
 *   rightIcon?: string | React.ReactNode;
 * }} props
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style = null,
  textStyle = null,
  leftIcon = undefined,
  rightIcon = undefined,
}) => {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const sizing = SIZES[size] || SIZES.md;
  const isDisabled = disabled || isLoading;

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <MaterialCommunityIcons
          name={icon}
          size={sizing.icon}
          color={palette.text}
          style={styles.icon}
        />
      );
    }
    return <View style={styles.icon}>{icon}</View>;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.86}
      style={[
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          opacity: isDisabled ? 0.58 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {leftIcon && renderIcon(leftIcon)}
      {isLoading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <Text style={[styles.text, { color: palette.text, fontSize: sizing.fontSize }, textStyle]}>
          {title}
        </Text>
      )}
      {rightIcon && !isLoading && renderIcon(rightIcon)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#16a34a',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  icon: {
    marginHorizontal: 4,
  },
});

export default Button;
