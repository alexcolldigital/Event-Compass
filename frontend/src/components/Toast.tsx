import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ visible, type, message, onHide, duration = 3000 }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => hide(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <Animated.View
      style={[
        styles.container,
        isSuccess ? styles.success : styles.error,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <MaterialCommunityIcons
        name={isSuccess ? 'check-circle' : 'alert-circle'}
        size={22}
        color="#fff"
      />
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  success: { backgroundColor: '#16a34a' },
  error: { backgroundColor: '#dc2626' },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
