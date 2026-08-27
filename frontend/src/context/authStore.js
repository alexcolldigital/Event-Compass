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
  pendingPhoneNumber: null,
  requiresPhoneVerification: false,
  isInitialized: false,

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
        // Only restore authenticated session if email is verified
        const isAuth = user.isEmailVerified === true;
        set({
          user,
          token,
          isAuthenticated: isAuth,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({ isLoading: false, isInitialized: true });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message, isInitialized: true });
    }
  },

  // Register user — stores token but does NOT set isAuthenticated so the
  // Auth stack stays visible and the app can navigate to VerifyScreen.
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.register(userData);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('authToken', response.token);
        }
      }
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      set({ user: response.user || null, token: response.token || null, isAuthenticated: false, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  // Register service provider
  registerProvider: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.registerProvider(userData);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('authToken', response.token);
        }
      }
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('user', JSON.stringify(response.user));
      }
      set({ user: response.user, token: response.token || null, isAuthenticated: false, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Provider registration failed', isLoading: false });
      throw error;
    }
  },

  // Login user (unified — email or phone)
  loginUnified: async (identifier, password) => {
    try {
      set({ isLoading: true, error: null, requiresPhoneVerification: false });
      const response = await authAPI.loginUnified(identifier, password);
      if (response.requiresTwoFactor) {
        set({ requiresTwoFactor: true, pendingUserId: response.userId, isLoading: false });
        return response;
      }
      if (response.requiresEmailVerification) {
        set({ user: response.user || null, token: null, isAuthenticated: false, isLoading: false, requiresPhoneVerification: false, pendingPhoneNumber: null });
        return response;
      }
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', response.token);
        window.localStorage.setItem('user', JSON.stringify(response.user));
      }
      if (response.requiresPhoneVerification) {
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: false,
          isLoading: false,
          requiresTwoFactor: false,
          pendingUserId: null,
          requiresPhoneVerification: true,
          pendingPhoneNumber: response.user?.phoneNumber || identifier,
        });
        return response;
      }
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        requiresTwoFactor: false,
        pendingUserId: null,
        requiresPhoneVerification: false,
        pendingPhoneNumber: null,
      });
      return response;
    } catch (error) {
      if (error?.requiresEmailVerification || error?.requiresDeviceVerification) {
        set({
          user: error.user || null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return error;
      }
      // HTTP 403 with requiresPhoneVerification comes through as a thrown error
      if (error?.requiresPhoneVerification) {
        set({
          requiresPhoneVerification: true,
          pendingPhoneNumber: identifier,
          isLoading: false,
          error: null,
        });
        return error; // return so callers don’t re-throw
      }
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

  // Verify email OTP
  verifyEmail: async (otp) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.verifyEmail(otp);
      const currentUser = get().user;
      if (currentUser) {
        const user = { ...currentUser, isEmailVerified: true };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Verify OTP for forgot password
  verifyOtp: async (email, otp) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.verifyOtp(email, otp);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reset password with verified token
  resetPasswordWithToken: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.resetPasswordWithToken(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Send OTP before change password
  sendChangePasswordOtp: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.sendChangePasswordOtp();
      set({ isLoading: false });
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
      set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false, requiresTwoFactor: false, pendingUserId: null, requiresPhoneVerification: false, pendingPhoneNumber: null });
      await Promise.all([AsyncStorage.removeItem('authToken'), AsyncStorage.removeItem('user')]);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('user');
      }
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

  // Send phone OTP
  sendPhoneOtp: async (phoneNumber) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.sendPhoneOtp(phoneNumber);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to send OTP', isLoading: false });
      throw error;
    }
  },

  // Verify phone OTP — safe whether user is authenticated or not
  verifyPhone: async (otp) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.verifyPhone(otp);
      const updatedUser = response.user || { ...get().user, isPhoneVerified: true };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('authToken', response.token);
        }
      }
      set({ user: updatedUser, isAuthenticated: true, isLoading: false, requiresPhoneVerification: false, pendingPhoneNumber: null });
      return response;
    } catch (error) {
      set({ error: error.message || 'OTP verification failed', isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
