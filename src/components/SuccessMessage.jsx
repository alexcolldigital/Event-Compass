/**
 * Success Message Component
 * Modern success alert with icon and close button
 * Supports light/dark mode with new design system
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SuccessMessage = ({ 
  message, 
  onClose, 
  style = '', 
  className = '',
  variant = 'default',
}) => {
  if (!message) return null;

  const variantStyles = {
    default: 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    filled: 'bg-emerald-100 border border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700',
    outline: 'bg-transparent border-2 border-emerald-500 dark:border-emerald-400',
    toast: 'bg-emerald-600 border-none dark:bg-emerald-500',
  };

  const textColors = {
    default: 'text-emerald-800 dark:text-emerald-200',
    filled: 'text-emerald-900 dark:text-emerald-100',
    outline: 'text-emerald-700 dark:text-emerald-300',
    toast: 'text-white',
  };

  const iconColors = {
    default: 'text-emerald-600 dark:text-emerald-400',
    filled: 'text-emerald-700 dark:text-emerald-300',
    outline: 'text-emerald-600 dark:text-emerald-400',
    toast: 'text-white',
  };

  return (
    <View className={`rounded-xl p-4 mb-4 flex-row items-start shadow-soft-sm ${variantStyles[variant]} ${style} ${className}`}>
      <MaterialCommunityIcons name="check-circle" size={24} className={`${iconColors[variant]} mt-0.5`} />
      <Text className={`${textColors[variant]} flex-1 ml-3 font-medium text-sm leading-relaxed`}>{message}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} className="ml-2 p-1 active:bg-black/10 dark:active:bg-white/10 rounded-lg">
          <MaterialCommunityIcons name="close" size={20} className={iconColors[variant]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SuccessMessage;