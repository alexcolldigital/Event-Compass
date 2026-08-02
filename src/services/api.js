/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

<<<<<<< HEAD
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://event-backend-kb9s.onrender.com/api';
=======
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://event-backend-kb9s.onrender.com';
>>>>>>> 8f51c6fbf0329277b83824a4dc53f1b1a1891012

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

// Service API calls
export const serviceAPI = {
  getAllServices: (query) => apiClient.get('/services', { params: query }),
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
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  getMyClientBookings: (query) =>
    apiClient.get('/bookings/client/my-bookings', { params: query }),
  getMyProviderBookings: (query) =>
    apiClient.get('/bookings/provider/my-bookings', { params: query }),
  confirmBooking: (id) => apiClient.patch(`/bookings/${id}/confirm`),
  cancelBooking: (id, data) => apiClient.patch(`/bookings/${id}/cancel`, data),
  completeBooking: (id) => apiClient.patch(`/bookings/${id}/complete`),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getAllUsers: (query) => apiClient.get('/admin/users', { params: query }),
  blockUser: (id, data) => apiClient.patch(`/admin/users/${id}/block`, data),
  verifyProvider: (id) => apiClient.patch(`/admin/users/${id}/verify`),
  getAllBookings: (query) => apiClient.get('/admin/bookings', { params: query }),
  getRevenueAnalytics: (query) => apiClient.get('/admin/revenue', { params: query }),
  getUserAnalytics: () => apiClient.get('/admin/users/analytics/breakdown'),
  getSystemReports: () => apiClient.get('/admin/reports'),
};

export default apiClient;
