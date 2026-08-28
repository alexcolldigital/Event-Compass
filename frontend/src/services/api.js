/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://event-backend-kb9s.onrender.com').replace(/\/$/, '');
const API_BASE_URL = API_URL.includes('/api') ? API_URL : `${API_URL}/api`;
const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT || 30000);

const getOrCreateDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  } catch (error) {
    return `${Platform.OS}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const getDeviceName = () => `${Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Web'} Device`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
const getStoredAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) return token;
  } catch (error) {
    console.error('Error reading auth token from AsyncStorage:', error);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('authToken');
  }

  return null;
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const deviceId = await getOrCreateDeviceId();
      config.headers['x-device-id'] = deviceId;
      config.headers['x-device-name'] = getDeviceName();
    } catch (error) {
      console.error('Error getting device metadata:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  registerProvider: (userData) => apiClient.post('/auth/register-provider', userData),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  loginWithPhone: (phoneNumber, password) => apiClient.post('/auth/login-phone', { phoneNumber, password }),
  loginUnified: (identifier, password) => apiClient.post('/auth/login-unified', { identifier, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  uploadProfileImage: (formData) =>
    apiClient.post('/auth/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  sendChangePasswordOtp: () => apiClient.post('/auth/send-change-password-otp'),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  forgotPassword: (identifier) => apiClient.post('/auth/forgot-password', { identifier }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  // Email verification
  verifyEmail: async (otp) => {
    const deviceId = await getOrCreateDeviceId();
    return apiClient.post('/auth/verify-email', { otp, deviceId, deviceName: getDeviceName() });
  },
  verifyOtp: (email, otp) => apiClient.post('/auth/verify-otp', { email, otp }),
  resetPasswordWithToken: (data) => apiClient.post('/auth/reset-password', data),
  resendVerification: (emailOrUserId) => {
    // Works unauthenticated — pass email or userId so backend can find the user
    const body = emailOrUserId
      ? (emailOrUserId.includes('@') ? { email: emailOrUserId } : { userId: emailOrUserId })
      : {};
    return apiClient.post('/auth/resend-verification', body);
  },
  // 2FA
  verifyTwoFactor: (userId, code) => apiClient.post('/auth/verify-2fa', { userId, code }),
  toggleTwoFactor: () => apiClient.post('/auth/2fa/toggle'),
  // Login history & devices
  getLoginHistory: () => apiClient.get('/auth/login-history'),
  getDevices: () => apiClient.get('/auth/devices'),
  addDevice: (deviceId, deviceName) => apiClient.post('/auth/devices', { deviceId, deviceName }),
  removeDevice: (deviceId) => apiClient.delete(`/auth/devices/${deviceId}`),
  saveFcmToken: (fcmToken) => apiClient.post('/auth/fcm-token', { fcmToken }),
  getMyNotifications: (params) => apiClient.get('/auth/notifications', { params }),
  markNotificationRead: (id) => apiClient.patch(`/auth/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/auth/notifications/read-all'),
};

// Service API calls
export const serviceAPI = {
  getAllServices: (query) => apiClient.get('/services', { params: query }),
  getPublicStats: () => apiClient.get('/services/stats'),
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  getMyServices: () => apiClient.get('/services/provider/my-services'),
  createService: (data) => apiClient.post('/services', data),
  uploadServiceMedia: (id, formData) =>
    apiClient.post(`/services/${id}/upload-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`),
  searchServices: (query) => apiClient.get('/services/search', { params: query }),
  toggleAvailability: (id) => apiClient.patch(`/services/${id}/toggle-availability`),
};

// Booking API calls
export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  checkoutCart: (data) => apiClient.post('/bookings/checkout', data),
  createBookingPaymentSession: (bookingId, origin, gateway) =>
    apiClient.post(`/bookings/${bookingId}/payment-session`, { origin, gateway }),
  markBookingPaymentSuccess: (bookingId) =>
    apiClient.post(`/bookings/${bookingId}/payment-success`),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  getMyClientBookings: (query) =>
    apiClient.get('/bookings/client/my-bookings', { params: query }),
  getMyProviderBookings: (query) =>
    apiClient.get('/bookings/provider/my-bookings', { params: query }),
  confirmBooking: (id, data) => apiClient.patch(`/bookings/${id}/confirm`, data || {}),
  rejectBooking: (id, data) => apiClient.patch(`/bookings/${id}/reject`, data),
  cancelBooking: (id, data) => apiClient.patch(`/bookings/${id}/cancel`, data),
  completeBooking: (id) => apiClient.patch(`/bookings/${id}/complete`),
  releaseEscrow: (id) => apiClient.patch(`/bookings/${id}/release-escrow`),
  disputeEscrow: (id, data) => apiClient.patch(`/bookings/${id}/dispute-escrow`, data),
};

// Admin API calls
export const adminAPI = {
  // Locations (public + admin CRUD)
  getLocations: () => apiClient.get('/locations'),
  createLocation: (data) => apiClient.post('/admin/locations', data),
  updateLocation: (id, data) => apiClient.put(`/admin/locations/${id}`, data),
  deleteLocation: (id) => apiClient.delete(`/admin/locations/${id}`),

  // Dashboard & Stats
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getAnalyticsDashboard: (query) => apiClient.get('/admin/analytics/dashboard', { params: query }),

  // Users
  getAllUsers: (query) => apiClient.get('/admin/users', { params: query }),
  createUser: (data) => apiClient.post('/admin/users', data),
  blockUser: (id, data) => apiClient.patch(`/admin/users/${id}/block`, data),
  verifyProvider: (id) => apiClient.patch(`/admin/users/${id}/verify`),
  assignRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),
  getUserAnalytics: () => apiClient.get('/admin/users/analytics/breakdown'),

  // Services (admin)
  getAllServices: (query) => apiClient.get('/admin/services', { params: query }),
  getServiceById: (id) => apiClient.get(`/admin/services/${id}`),
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),
  toggleFeatured: (id) => apiClient.patch(`/admin/services/${id}/toggle-featured`),
  toggleActive: (id) => apiClient.patch(`/admin/services/${id}/toggle-active`),
  uploadServiceMedia: (id, formData) =>
    apiClient.post(`/admin/services/${id}/upload-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Bookings
  getAllBookings: (query) => apiClient.get('/admin/bookings', { params: query }),
  getBookingById: (id) => apiClient.get(`/admin/bookings/${id}`),
  confirmBooking: (id, data) => apiClient.patch(`/admin/bookings/${id}/confirm`, data || {}),
  rejectBooking: (id, data) => apiClient.patch(`/admin/bookings/${id}/reject`, data),
  cancelBooking: (id, data) => apiClient.patch(`/admin/bookings/${id}/cancel`, data),
  completeBooking: (id) => apiClient.patch(`/admin/bookings/${id}/complete`),

  // Commission
  getCommissionSettings: () => apiClient.get('/admin/commission'),
  updateCommissionSettings: (data) => apiClient.put('/admin/commission', data),
  getCommissionBreakdown: (query) => apiClient.get('/admin/commission/breakdown', { params: query }),

  // Payments
  getAllPayments: (query) => apiClient.get('/admin/payments', { params: query }),

  // Refunds
  getPendingRefunds: (query) => apiClient.get('/admin/refunds', { params: query }),
  approveRefund: (id, data) => apiClient.patch(`/admin/refunds/${id}/approve`, data),
  rejectRefund: (id, data) => apiClient.patch(`/admin/refunds/${id}/reject`, data),

  // Content Moderation
  getFlaggedReviews: (query) => apiClient.get('/admin/moderation/reviews', { params: query }),
  moderateReview: (id, data) => apiClient.patch(`/admin/moderation/reviews/${id}`, data),
  getFlaggedServices: (query) => apiClient.get('/admin/moderation/services', { params: query }),
  moderateService: (id, data) => apiClient.patch(`/admin/moderation/services/${id}`, data),

  // Reports
  getRevenueAnalytics: (query) => apiClient.get('/admin/revenue', { params: query }),
  getSystemReports: () => apiClient.get('/admin/reports'),
  getDetailedReports: (query) => apiClient.get('/admin/reports/detailed', { params: query }),

  // Categories
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),

  // Coupons
  getCoupons: (query) => apiClient.get('/admin/coupons', { params: query }),
  createCoupon: (data) => apiClient.post('/admin/coupons', data),
  updateCoupon: (id, data) => apiClient.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => apiClient.delete(`/admin/coupons/${id}`),
  toggleCoupon: (id) => apiClient.patch(`/admin/coupons/${id}/toggle`),

  // Promotions
  getPromotions: (query) => apiClient.get('/admin/promotions', { params: query }),
  createPromotion: (data) => apiClient.post('/admin/promotions', data),
  updatePromotion: (id, data) => apiClient.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id) => apiClient.delete(`/admin/promotions/${id}`),
  togglePromotion: (id) => apiClient.patch(`/admin/promotions/${id}/toggle`),

  // Notifications
  getNotifications: (query) => apiClient.get('/admin/notifications', { params: query }),
  createNotification: (data) => apiClient.post('/admin/notifications', data),
  sendNotification: (id) => apiClient.post(`/admin/notifications/${id}/send`),
  deleteNotification: (id) => apiClient.delete(`/admin/notifications/${id}`),

  // CMS Pages
  getCMSPages: (query) => apiClient.get('/admin/cms', { params: query }),
  getCMSPage: (id) => apiClient.get(`/admin/cms/${id}`),
  createCMSPage: (data) => apiClient.post('/admin/cms', data),
  updateCMSPage: (id, data) => apiClient.put(`/admin/cms/${id}`, data),
  deleteCMSPage: (id) => apiClient.delete(`/admin/cms/${id}`),

  // Audit Logs
  getAuditLogs: (query) => apiClient.get('/admin/audit-logs', { params: query }),
};

// Message API calls
export const messageAPI = {
  sendMessage: (formData) =>
    apiClient.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getConversations: () => apiClient.get('/messages/conversations'),
  getMessages: (conversationId, params) =>
    apiClient.get(`/messages/conversation/${conversationId}`, { params }),
  getBookingMessages: (bookingId) => apiClient.get(`/messages/booking/${bookingId}`),
  markRead: (conversationId) =>
    apiClient.patch(`/messages/conversation/${conversationId}/read`),
  deleteMessage: (id) => apiClient.delete(`/messages/${id}`),
  clearConversation: (conversationId) => apiClient.delete(`/messages/conversation/${conversationId}`),
  getAdminContacts: () => apiClient.get('/auth/admin-contacts'),
};

export default apiClient;
