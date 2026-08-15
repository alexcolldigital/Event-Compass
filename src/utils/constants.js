/**
 * Frontend Constants
 * Shared constants for the frontend application
 */

// App Configuration
export const APP_CONFIG = {
  NAME: 'Event Compass',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
};

// Color Palette - Modern Green Theme
export const COLORS = {
  // Primary Green Shades
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#6ee7b7',
  primaryXLight: '#d1fae5',
  
  // Secondary/Accent Colors
  secondary: '#14b8a6',
  accent: '#06b6d4',
  
  // Status Colors
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Neutral/Gray Palette
  light: '#f9fafb',
  lighter: '#f3f4f6',
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  dark: '#1f2937',
  darkBg: '#111827',
  white: '#ffffff',
  black: '#000000',
  
  // Gray Shades
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    150: '#eff6f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Green Tints for Modern Look
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SERVICE_PROVIDER: 'service_provider',
  CLIENT: 'client',
  VENDOR: 'vendor',
};

// Payment Plan
export const PAYMENT_PLAN = {
  FULL: 'full',
  SPLIT_50_50: 'split_50_50',
  DEPOSIT_20: 'deposit_20',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Event Types
export const EVENT_TYPES = {
  CELEBRATORY: 'celebratory',
  FORMAL: 'formal',
  ENTERTAINMENT: 'entertainment',
  SPORTS: 'sports',
  EDUCATIONAL: 'educational',
  COMMUNITY: 'community',
  FUNERAL: 'funeral',
};

// Search / Browse Categories (with optional subcategories)
export const SERVICE_CATEGORIES = [
  { id: 1,  name: 'Canopies and Tent',                              icon: 'tent',                    subcategories: ['12 by 12 Canopy', '12 by 24 Canopy', '20 by 40 Tent', '30 by 60 Tent', '40 by 80 Tent'] },
  { id: 2,  name: 'Chairs',                                         icon: 'seat',                    subcategories: ['Plastic Chair', 'Chivalry Chair', 'Bridal Chair'] },
  { id: 3,  name: 'Tables',                                         icon: 'table-furniture',         subcategories: ['Plastic Table', 'Banquet Table'] },
  { id: 4,  name: 'Event Planners and Managers',                    icon: 'clipboard-list',          subcategories: [] },
  { id: 5,  name: 'Events Services Providers and Vendors',          icon: 'store',                   subcategories: [] },
  { id: 6,  name: 'Events Facilitators and Agents',                 icon: 'handshake',               subcategories: [] },
  { id: 7,  name: 'Special Events Hosts and Organizers',            icon: 'account-star',            subcategories: [] },
  { id: 8,  name: 'Events Venues',                                  icon: 'home-city',               subcategories: [] },
  { id: 9,  name: 'Event Decorators',                               icon: 'palette',                 subcategories: [] },
  { id: 10, name: 'Make-up Artists',                                icon: 'face-woman-shimmer',      subcategories: [] },
  { id: 11, name: 'Ushers',                                         icon: 'account-tie',             subcategories: [] },
  { id: 12, name: 'Bouncers',                                       icon: 'shield-account',          subcategories: [] },
  { id: 13, name: 'Events Facilities Rental and Hiring Companies',  icon: 'warehouse',               subcategories: [] },
  { id: 14, name: 'Ice Chilling Services',                          icon: 'snowflake',               subcategories: [] },
  { id: 15, name: 'Refrigerated Vans/Cooling Vans Providers',       icon: 'truck-snowflake',         subcategories: [] },
  { id: 16, name: 'Food Caterers',                                  icon: 'silverware-fork-knife',   subcategories: [] },
  { id: 17, name: 'Drinks Suppliers',                               icon: 'bottle-wine',             subcategories: [] },
  { id: 18, name: 'Music (D-J and Live Performances)',              icon: 'music',                   subcategories: [] },
  { id: 19, name: 'MCs and Compares',                               icon: 'microphone',              subcategories: [] },
  { id: 20, name: 'Comedians and Entertainers',                     icon: 'emoticon-happy',          subcategories: [] },
];

// Service Provider Types
export const SERVICE_PROVIDER_TYPE_OPTIONS = [
  { value: 'event_planner', label: 'Event planners and managers' },
  { value: 'event_planner_and_manager', label: 'Event planners and managers' },
  { value: 'events_services_provider_and_vendor', label: 'Events services providers and vendors' },
  { value: 'events_facilitator_and_agent', label: 'Events facilitators and agents' },
  { value: 'special_events_host_and_organizer', label: 'Special events hosts and organizers' },
  { value: 'events_venue_owner_and_manager', label: 'Events venue owners and managers' },
  { value: 'venue_decorator', label: 'Venue decorators' },
  { value: 'makeup_artist', label: 'Make-up artists' },
  { value: 'usher', label: 'Ushers' },
  { value: 'bouncer', label: 'Bouncers' },
  { value: 'events_facilities_rental_and_hiring_company', label: 'Events facilities rental and hiring companies' },
  { value: 'ice_chilling_services', label: 'Ice chilling services' },
  { value: 'refrigerated_vans_provider', label: 'Refrigerated vans/cooling vans providers' },
  { value: 'food_caterer', label: 'Food caterers' },
  { value: 'drinks_supplier', label: 'Drinks suppliers' },
  { value: 'music_dj_and_live_performance', label: 'Music (D-J and live performances)' },
  { value: 'mc_and_compares', label: 'MCs and compares' },
  { value: 'comedian_and_entertainer', label: 'Comedians and entertainers' },
  { value: 'venue_owner', label: 'Venue owners' },
  { value: 'dj', label: 'DJs' },
  { value: 'live_performance', label: 'Live performances' },
  { value: 'mc_compare', label: 'MCs and compare' },
  { value: 'comedian_entertainer', label: 'Comedians and entertainers' },
];

export const SERVICE_PROVIDER_TYPES = SERVICE_PROVIDER_TYPE_OPTIONS.map(({ value }) => value);

// Messages
export const MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR_LOADING: 'Error loading data',
  PLEASE_TRY_AGAIN: 'Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  BOOKING_SUCCESS: 'Booking created successfully!',
  BOOKING_CONFIRMED: 'Booking confirmed!',
  BOOKING_CANCELLED: 'Booking cancelled',
  PAYMENT_SUCCESS: 'Payment successful!',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_SUCCESS: 'Registration successful! Please login.',
  LOGOUT_CONFIRM: 'Are you sure you want to logout?',
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Rating System
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0,
};

// Time Intervals (in milliseconds)
export const TIME_INTERVALS = {
  DEBOUNCE_SEARCH: 500,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  API_TIMEOUT: 10000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recentSearches',
};

// Navigation Screens
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  REGISTER_PROVIDER: 'RegisterProvider',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main
  HOME: 'Home',
  SEARCH: 'Search',
  BOOKINGS: 'Bookings',
  PROFILE: 'Profile',

  // Details
  SERVICE_DETAIL: 'ServiceDetail',
  BOOKING_DETAIL: 'BookingDetail',
  PROVIDER_PROFILE: 'ProviderProfile',

  // Admin
  ADMIN_DASHBOARD: 'AdminDashboard',
  MANAGE_USERS: 'ManageUsers',
  MANAGE_BOOKINGS: 'ManageBookings',
  REVENUE_ANALYTICS: 'RevenueAnalytics',
};

// Icon Names (check @expo/vector-icons)
export const ICONS = {
  HOME: 'home',
  SEARCH: 'magnify',
  CALENDAR: 'calendar-check',
  USER: 'account',
  SETTINGS: 'cog',
  LOGOUT: 'logout',
  MENU: 'menu',
  CLOSE: 'close',
  BACK: 'arrow-left',
  NEXT: 'arrow-right',
  STAR: 'star',
  HEART: 'heart',
  SHARE: 'share-variant',
  PHONE: 'phone',
  EMAIL: 'email',
  LOCATION: 'map-marker',
  CLOCK: 'clock',
  PAYMENT: 'credit-card',
  SUCCESS: 'check-circle',
  ERROR: 'alert-circle',
  WARNING: 'alert',
  INFO: 'information',
};

export default {
  APP_CONFIG,
  COLORS,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  EVENT_TYPES,
  SERVICE_PROVIDER_TYPES,
  MESSAGES,
  VALIDATION,
  PAGINATION,
  RATING,
  TIME_INTERVALS,
  STORAGE_KEYS,
  SCREENS,
  ICONS,
};
