/**
 * Auth Navigator
 * Navigation for unauthenticated users
 */

import React, { lazy, Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loading from '../components/Loading';

// Lazy-loaded auth screens
const LoginScreen = lazy(() => import('../screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('../screens/auth/RegisterScreen'));
const RegisterProviderScreen = lazy(() => import('../screens/auth/RegisterProviderScreen'));
const ForgotPasswordScreen = lazy(() => import('../screens/auth/ForgotPasswordScreen'));
const VerifyScreen = lazy(() => import('../screens/auth/VerifyScreen'));
const ResetPasswordScreen = lazy(() => import('../screens/auth/ResetPasswordScreen'));

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
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
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
