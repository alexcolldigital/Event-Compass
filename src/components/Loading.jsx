/**
 * Loading Component
 * Modern loading spinner with optional message
 * Supports light/dark mode with new design system
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export const Loading = ({ 
  message = 'Loading...', 
  fullScreen = true, 
  size = 'large',
  className = '',
  color = 'primary-600',
}) => {
  const containerClass = fullScreen
    ? 'flex-1 items-center justify-center bg-white dark:bg-neutral-950'
    : 'items-center justify-center py-12';

  return (
    <View className={`${containerClass} ${className}`}>
      <View className="items-center gap-4">
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text className="text-neutral-700 dark:text-neutral-300 font-medium text-center px-4">{message}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * Skeleton Loader - For content placeholders
 */
export const Skeleton = ({ 
  variant = 'text', 
  width = '100%', 
  height, 
  className = '',
  count = 1,
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded w-3/4',
    card: 'h-48 rounded-2xl',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-12 rounded-xl',
    image: 'h-48 w-full rounded-2xl',
    marketplace: 'h-64 w-full rounded-2xl',
  };

  const skeletonStyle = {
    width,
    height: height || undefined,
    background: 'linear-gradient(90deg, #e5e5e5 25%, #f5f5f5 50%, #e5e5e5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 'inherit',
  };

  const darkSkeletonStyle = {
    ...skeletonStyle,
    background: 'linear-gradient(90deg, #262626 25%, #404040 50%, #262626 75%)',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <View
      key={i}
      className={`${variants[variant]} ${className}`}
      style={{ ...skeletonStyle, ...(height ? { height } : {}) }}
    />
  ));

  return <View className="space-y-3">{items}</View>;
};

export default Loading;