/**
 * Auth Navigator
 * Navigation for unauthenticated users
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterProviderScreen from '../screens/auth/RegisterProviderScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterProvider" component={RegisterProviderScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
    </Stack.Navigator>
  );
}
