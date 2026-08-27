/**
 * Root Navigator
 * Main navigation structure for authenticated and unauthenticated users
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../context/authStore.js';
import Loading from '../components/Loading.jsx';

// Import navigation stacks
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <Loading fullScreen />;
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'main' : 'auth'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
