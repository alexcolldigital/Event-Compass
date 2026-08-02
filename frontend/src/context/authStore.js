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

  // Initialize auth state from storage
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('user');

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
      const errorMessage = error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });

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
