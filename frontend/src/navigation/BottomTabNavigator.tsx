/**
 * Bottom Tab Navigator
 * Main navigation for authenticated users with bottom tabs
 */

import React, { lazy, Suspense, useRef } from 'react';
import { Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../context/authStore';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';

// Lazy-loaded main screens
const HomeScreen = lazy(() => import('../screens/main/HomeScreen'));
const SearchScreen = lazy(() => import('../screens/main/SearchScreen'));
const BookingsScreen = lazy(() => import('../screens/main/BookingsScreen'));
const ProfileScreen = lazy(() => import('../screens/main/ProfileScreen'));

// Lazy-loaded detail screens
const ServiceDetailScreen = lazy(() => import('../screens/main/ServiceDetailScreen'));
const BookingDetailScreen = lazy(() => import('../screens/main/BookingDetailScreen'));
const ProviderServicesScreen = lazy(() => import('../screens/main/ProviderServicesScreen'));
const PaymentResultScreen = lazy(() => import('../screens/main/PaymentResultScreen'));
const WebCheckoutScreen = lazy(() => import('../screens/main/WebCheckoutScreen'));
const EditProfileScreen = lazy(() => import('../screens/main/EditProfileScreen'));
const ChangePasswordScreen = lazy(() => import('../screens/main/ChangePasswordScreen'));
const VerifyScreen = lazy(() => import('../screens/auth/VerifyScreen'));
const NotificationsScreen = lazy(() => import('../screens/main/NotificationsScreen'));
const HelpSupportScreen = lazy(() => import('../screens/main/HelpSupportScreen'));
const AboutScreen = lazy(() => import('../screens/main/AboutScreen'));
const CheckoutScreen = lazy(() => import('../screens/main/CheckoutScreen'));
const EventDetailsScreen = lazy(() => import('../screens/main/EventDetailsScreen'));
const EscrowStatusScreen = lazy(() => import('../screens/main/EscrowStatusScreen'));
const ChatScreen = lazy(() => import('../screens/main/ChatScreen'));
const DisputeEvidenceScreen = lazy(() => import('../screens/main/DisputeEvidenceScreen'));
const VendorVerificationScreen = lazy(() => import('../screens/main/VendorVerificationScreen'));
const ConversationsScreen = lazy(() => import('../screens/main/ConversationsScreen'));

// Lazy-loaded admin screens
const AdminDashboardScreen = lazy(() => import('../screens/admin/AdminDashboardScreen'));
const ManageUsersScreen = lazy(() => import('../screens/admin/ManageUsersScreen'));
const ManageBookingsScreen = lazy(() => import('../screens/admin/ManageBookingsScreen'));
const RevenueAnalyticsScreen = lazy(() => import('../screens/admin/RevenueAnalyticsScreen'));
const ManageServicesScreen = lazy(() => import('../screens/admin/ManageServicesScreen'));
const CommissionManagementScreen = lazy(() => import('../screens/admin/CommissionManagementScreen'));
const PaymentMonitoringScreen = lazy(() => import('../screens/admin/PaymentMonitoringScreen'));
const RefundApprovalScreen = lazy(() => import('../screens/admin/RefundApprovalScreen'));
const ContentModerationScreen = lazy(() => import('../screens/admin/ContentModerationScreen'));
const ReportsManagementScreen = lazy(() => import('../screens/admin/ReportsManagementScreen'));
const CategoryManagementScreen = lazy(() => import('../screens/admin/CategoryManagementScreen'));
const CouponManagementScreen = lazy(() => import('../screens/admin/CouponManagementScreen'));
const PromotionsManagementScreen = lazy(() => import('../screens/admin/PromotionsManagementScreen'));
const AnalyticsDashboardScreen = lazy(() => import('../screens/admin/AnalyticsDashboardScreen'));
const NotificationManagementScreen = lazy(() => import('../screens/admin/NotificationManagementScreen'));
const CMSManagementScreen = lazy(() => import('../screens/admin/CMSManagementScreen'));
const AuditLogsScreen = lazy(() => import('../screens/admin/AuditLogsScreen'));
const LocationManagementScreen = lazy(() => import('../screens/admin/LocationManagementScreen'));

// Import constants
import { COLORS } from '../utils/constants';
import { showToast } from '../utils/toast';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const LazyScreen = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading fullScreen />}>{children}</Suspense>
);

// Home stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen">{({ navigation }) => <LazyScreen><HomeScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ServiceDetail" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ServiceDetailScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="EventDetails" options={{ animation: 'slide_from_right' }}>{({ navigation }) => <LazyScreen><EventDetailsScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Checkout" options={{ animation: 'slide_from_right' }}>{({ navigation, route }) => <LazyScreen><CheckoutScreen navigation={navigation} route={route} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="WebCheckout" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><WebCheckoutScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="BookingDetail" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><BookingDetailScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="PaymentResult" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><PaymentResultScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Search stack
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen">{({ navigation }) => <LazyScreen><SearchScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ServiceDetail" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ServiceDetailScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="EventDetails" options={{ animation: 'slide_from_right' }}>{({ navigation }) => <LazyScreen><EventDetailsScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Checkout" options={{ animation: 'slide_from_right' }}>{({ navigation, route }) => <LazyScreen><CheckoutScreen navigation={navigation} route={route} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="WebCheckout" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><WebCheckoutScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="BookingDetail" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><BookingDetailScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="PaymentResult" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><PaymentResultScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Bookings stack
function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsScreen">{({ navigation }) => <LazyScreen><BookingsScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="BookingDetail" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><BookingDetailScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="WebCheckout" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><WebCheckoutScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="PaymentResult" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><PaymentResultScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Checkout" options={{ animation: 'slide_from_right' }}>{({ navigation, route }) => <LazyScreen><CheckoutScreen navigation={navigation} route={route} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="EventDetails" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><EventDetailsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="EscrowStatus" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><EscrowStatusScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Conversations" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ConversationsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="DisputeEvidence" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><DisputeEvidenceScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="VendorVerification" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><VendorVerificationScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Messages stack
function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsScreen">{() => <LazyScreen><ConversationsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Provider services stack
function ProviderServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderServices" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ProviderServicesScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Admin stack
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboardScreen">{({ navigation, route }) => <LazyScreen><AdminDashboardScreen navigation={navigation} route={route} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ManageUsers" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ManageUsersScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ManageBookings" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ManageBookingsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ManageServices" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ManageServicesScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="RevenueAnalytics" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><RevenueAnalyticsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="CommissionManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><CommissionManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="PaymentMonitoring" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><PaymentMonitoringScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="RefundApproval" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><RefundApprovalScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ContentModeration" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ContentModerationScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ReportsManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ReportsManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="CategoryManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><CategoryManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="CouponManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><CouponManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="PromotionsManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><PromotionsManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="AnalyticsDashboard" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><AnalyticsDashboardScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="NotificationManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><NotificationManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="CMSManagement" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><CMSManagementScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="AuditLogs" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><AuditLogsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="LocationManagement" options={{ animation: 'slide_from_right' }}>{({ navigation }) => <LazyScreen><LocationManagementScreen navigation={navigation} /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Conversations" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ConversationsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

// Profile stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen">{() => <LazyScreen><ProfileScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="EditProfile" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><EditProfileScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ChangePassword" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChangePasswordScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Verify" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><VerifyScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Notifications" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><NotificationsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="HelpSupport" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><HelpSupportScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="About" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><AboutScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="ProviderServices" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ProviderServicesScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="AdminDashboard" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><AdminDashboardScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Conversations" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ConversationsScreen /></LazyScreen>}</Stack.Screen>
      <Stack.Screen name="Chat" options={{ animation: 'slide_from_right' }}>{() => <LazyScreen><ChatScreen /></LazyScreen>}</Stack.Screen>
    </Stack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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

  const isAdmin = user?.role === 'admin';

  const backPressedOnce = useRef(false);
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce.current) {
          BackHandler.exitApp();
          return true;
        }
        backPressedOnce.current = true;
        showToast('Press back again to exit');
        setTimeout(() => { backPressedOnce.current = false; }, 2000);
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const tabItems = isAdmin
    ? [
        { name: 'Admin', component: AdminStack, label: 'Admin' },
        { name: 'Messages', component: MessagesStack, label: 'Messages' },
        { name: 'Profile', component: ProfileStack, label: 'Profile' },
      ]
    : [
        { name: 'Home', component: HomeStack, label: 'Home' },
        { name: 'Search', component: SearchStack, label: 'Search' },
        { name: 'Bookings', component: BookingsStack, label: 'Bookings' },
        { name: 'Messages', component: MessagesStack, label: 'Messages' },
        ...(isProvider ? [{ name: 'Services', component: ProviderServicesStack, label: 'Services' }] : []),
        { name: 'Profile', component: ProfileStack, label: 'Profile' },
      ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = 'magnify';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar-check' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'message-text' : 'message-text-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
          marginTop: 1,
          textTransform: 'capitalize',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          borderRadius: 12,
          minWidth: 0,
          flex: 1,
        },
        tabBarStyle: {
          backgroundColor: tabBarColors.background,
          borderTopColor: tabBarColors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 6,
          shadowColor: tabBarColors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 10,
          ...(Platform.OS === 'web' && {
            position: 'fixed' as any,
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: 1200,
            marginLeft: 'auto' as any,
            marginRight: 'auto' as any,
          }),
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
          }}
        />
      ))}
    </Tab.Navigator>
  );
}