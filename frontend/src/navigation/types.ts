/**
 * Navigation Types
 * Type definitions for React Navigation
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RegisterProvider: undefined;
  ForgotPassword: undefined;
  Verify: { mode: 'email' | 'phone'; token?: string; phoneNumber?: string };
};

// Main Stack (Bottom Tabs)
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Services: undefined;
  Profile: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  ServiceDetail: { serviceId: string };
  EventDetails: undefined;
  Checkout: { eventDetails: any };
};

// Search Stack
export type SearchStackParamList = {
  SearchScreen: undefined;
  ServiceDetail: { serviceId: string };
  EventDetails: undefined;
  Checkout: { eventDetails: any };
};

// Bookings Stack
export type BookingsStackParamList = {
  BookingsScreen: undefined;
  BookingDetail: { bookingId: string };
  WebCheckout: { url: string };
  PaymentResult: { success: boolean; bookingId?: string };
  EventDetails: undefined;
  Checkout: { eventDetails: any };
  EscrowStatus: { bookingId: string };
  Chat: { bookingId: string; otherUserId: string };
  DisputeEvidence: { bookingId: string };
  VendorVerification: { providerId: string };
};

// Provider Services Stack
export type ProviderServicesStackParamList = {
  ProviderServices: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  About: undefined;
  ProviderServices: undefined;
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManageBookings: undefined;
  RevenueAnalytics: undefined;
  ManageServices: undefined;
};

// Admin Stack (nested in Profile Stack)
export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManageBookings: undefined;
  RevenueAnalytics: undefined;
  ManageServices: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Type helpers for navigation props
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = NativeStackNavigationProp<MainTabParamList>;
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type SearchStackNavigationProp = NativeStackNavigationProp<SearchStackParamList>;
export type BookingsStackNavigationProp = NativeStackNavigationProp<BookingsStackParamList>;
export type ProviderServicesStackNavigationProp = NativeStackNavigationProp<ProviderServicesStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
export type AdminStackNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;