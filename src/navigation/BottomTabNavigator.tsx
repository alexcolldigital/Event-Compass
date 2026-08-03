/**
 * Bottom Tab Navigator
 * Main navigation for authenticated users with bottom tabs
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../context/authStore';
import { useTheme } from '../context/ThemeContext';

// Import main screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import detail screens
import ServiceDetailScreen from '../screens/main/ServiceDetailScreen';
import BookingDetailScreen from '../screens/main/BookingDetailScreen';
import ProviderServicesScreen from '../screens/main/ProviderServicesScreen';
import PaymentResultScreen from '../screens/main/PaymentResultScreen';
import WebCheckoutScreen from '../screens/main/WebCheckoutScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import AboutScreen from '../screens/main/AboutScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManageBookingsScreen from '../screens/admin/ManageBookingsScreen';
import RevenueAnalyticsScreen from '../screens/admin/RevenueAnalyticsScreen';

// Import constants
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home stack
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// Search stack
function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// Bookings stack
function BookingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BookingsScreen" component={BookingsScreen} />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="WebCheckout"
        component={WebCheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PaymentResult"
        component={PaymentResultScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// Provider services stack
function ProviderServicesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProviderServices"
        component={ProviderServicesScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// Profile stack
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProviderServices"
        component={ProviderServicesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ManageBookings"
        component={ManageBookingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RevenueAnalytics"
        component={RevenueAnalyticsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isProvider = user?.role === 'service_provider';
  const isDark = theme === 'dark';

  const tabBarColors = isDark
    ? {
        background: '#0f172a',
        border: '#334155',
        active: '#34d399',
        inactive: '#94a3b8',
        shadow: 'rgba(2, 6, 23, 0.45)',
      }
    : {
        background: '#ffffff',
        border: '#e2e8f0',
        active: COLORS.primary,
        inactive: '#64748b',
        shadow: 'rgba(15, 23, 42, 0.16)',
      };

  const tabItems = [
    { name: 'Home', component: HomeStack, label: 'Home' },
    { name: 'Search', component: SearchStack, label: 'Search' },
    { name: 'Bookings', component: BookingsStack, label: 'Bookings' },
    ...(isProvider ? [{ name: 'Services', component: ProviderServicesStack, label: 'Services' }] : []),
    { name: 'Profile', component: ProfileStack, label: 'Profile' },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'magnify' : 'magnify';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar-check' : 'calendar-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 13,
          marginTop: 2,
          textTransform: 'uppercase',
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          borderRadius: 16,
        },
        tabBarStyle: {
          backgroundColor: tabBarColors.background,
          borderTopColor: tabBarColors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: tabBarColors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 10,
        },
      })}
    >
      {tabItems.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (tab.name === 'Bookings') {
                navigation.navigate(tab.name, { screen: 'BookingsScreen' });
                return;
              }
              defaultHandler();
            },
            ...(tab.name === 'Profile' && {
              unmountOnBlur: true,
            }),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
