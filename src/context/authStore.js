/**
 * Auth Context/Store
 * Global state management for authentication
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresTwoFactor: false,
  pendingUserId: null,

  // Initialize auth state from storage
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      let token = null;
      let userStr = null;

      try {
        token = await AsyncStorage.getItem('authToken');
        userStr = await AsyncStorage.getItem('user');
      } catch (error) {
        console.error('Error reading auth state from AsyncStorage:', error);
      }

      if ((!token || !userStr) && typeof window !== 'undefined' && window.localStorage) {
        token = token || window.localStorage.getItem('authToken');
        userStr = userStr || window.localStorage.getItem('user');
      }

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Register user
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.register(userData);

      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', response.token);
        window.localStorage.setItem('user', JSON.stringify(response.user));
      }

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Register service provider
  registerProvider: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.registerProvider(userData);

      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Provider registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.login(email, password);
      if (response.requiresTwoFactor) {
        set({ requiresTwoFactor: true, pendingUserId: response.userId, isLoading: false });
        return response;
      }
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', response.token);
        window.localStorage.setItem('user', JSON.stringify(response.user));
      }
      set({ user: response.user, token: response.token, isAuthenticated: true, isLoading: false, requiresTwoFactor: false, pendingUserId: null });
      return response;
    } catch (error) {
      set({ error: error.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  // Verify 2FA code
  verifyTwoFactor: async (code) => {
    try {
      set({ isLoading: true, error: null });
      const { pendingUserId } = get();
      const response = await authAPI.verifyTwoFactor(pendingUserId, code);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      set({ user: response.user, token: response.token, isAuthenticated: true, isLoading: false, requiresTwoFactor: false, pendingUserId: null });
      return response;
    } catch (error) {
      set({ error: error.message || '2FA verification failed', isLoading: false });
      throw error;
    }
  },

  // Toggle 2FA
  toggleTwoFactor: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.toggleTwoFactor();
      const user = { ...get().user, twoFactorEnabled: response.twoFactorEnabled };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.verifyEmail(token);
      const user = { ...get().user, isEmailVerified: true };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get login history
  getLoginHistory: async () => {
    try {
      const response = await authAPI.getLoginHistory();
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Get trusted devices
  getDevices: async () => {
    try {
      const response = await authAPI.getDevices();
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Remove trusted device
  removeDevice: async (deviceId) => {
    try {
      const response = await authAPI.removeDevice(deviceId);
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false, requiresTwoFactor: false, pendingUserId: null });
      await AsyncStorage.multiRemove(['authToken', 'user']);
      return true;
    } catch (error) {
      set({ error: error.message || 'Logout failed', isLoading: false });
      return false;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.updateProfile(data);

      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.forgotPassword(email);

      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.resetPassword(data);

      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
