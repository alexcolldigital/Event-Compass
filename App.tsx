import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import './src/styles/globalStyles.js';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuthStore } from './src/context/authStore';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';

const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:19007';
const linking = {
  prefixes: [appUrl, 'http://localhost:3000', 'http://localhost:19007'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          Home: {
            path: 'home',
            screens: {
              HomeScreen: '',
              ServiceDetail: 'service/:serviceId',
              Checkout: 'checkout',
            },
          },
          Search: {
            path: 'search',
            screens: {
              SearchScreen: '',
              ServiceDetail: 'service/:serviceId',
              Checkout: 'checkout',
            },
          },
          Bookings: {
            path: 'bookings',
            screens: {
              BookingsScreen: '',
              BookingDetail: 'booking/:bookingId',
              WebCheckout: 'web-checkout',
              PaymentResult: 'payment-result',
              Checkout: 'checkout',
            },
          },
          Services: {
            path: 'services',
            screens: {
              ProviderServices: '',
            },
          },
          Profile: {
            path: 'profile',
            screens: {
              ProfileScreen: '',
              EditProfile: 'edit-profile',
              ChangePassword: 'change-password',
              Notifications: 'notifications',
              HelpSupport: 'help-support',
              About: 'about',
              ProviderServices: 'provider-services',
              AdminDashboard: 'admin',
              ManageUsers: 'admin/users',
              ManageBookings: 'admin/bookings',
              RevenueAnalytics: 'admin/revenue',
            },
          },
        },
      },
    },
  },
};

function AppShell() {
  const { theme } = useTheme();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
