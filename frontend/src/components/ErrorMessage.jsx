/**
 * Error Message Component
 * Modern error alert with icon and close button
 * Supports light/dark mode with new design system
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ErrorMessage = ({
  error,
  onClose = undefined,
  style = undefined,
  className = '',
  variant = 'default',
}) => {
  if (!error) return null;

  const variantStyles = {
    default: {
      container: styles.defaultContainer,
      text: styles.defaultText,
      icon: styles.defaultIcon,
      closeButton: styles.defaultCloseButton,
    },
    filled: {
      container: styles.filledContainer,
      text: styles.filledText,
      icon: styles.filledIcon,
      closeButton: styles.defaultCloseButton,
    },
    outline: {
      container: styles.outlineContainer,
      text: styles.outlineText,
      icon: styles.outlineIcon,
      closeButton: styles.defaultCloseButton,
    },
    toast: {
      container: styles.toastContainer,
      text: styles.toastText,
      icon: styles.toastText,
      closeButton: styles.toastCloseButton,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <View style={[styles.container, currentVariant.container, style]}>
      <MaterialCommunityIcons name="alert-circle" size={24} color={currentVariant.icon.color} style={styles.icon} />
      <Text style={[styles.messageText, currentVariant.text]}>{error}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={[styles.closeButton, currentVariant.closeButton]}>
          <MaterialCommunityIcons name="close" size={20} color={currentVariant.icon.color} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  defaultContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  filledContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  toastContainer: {
    backgroundColor: '#dc2626',
    borderWidth: 0,
  },
  icon: {
    marginTop: 1,
  },
  messageText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  defaultText: {
    color: '#991b1b',
  },
  filledText: {
    color: '#7f1d1d',
  },
  outlineText: {
    color: '#b91c1c',
  },
  toastText: {
    color: '#ffffff',
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
    borderRadius: 8,
  },
  defaultCloseButton: {
    backgroundColor: 'transparent',
  },
  toastCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  defaultIcon: {
    color: '#dc2626',
  },
  filledIcon: {
    color: '#b91c1c',
  },
  outlineIcon: {
    color: '#dc2626',
  },
});

export default ErrorMessage;