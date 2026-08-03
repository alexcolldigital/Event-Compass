/**
 * Booking Store
 * Global state management for bookings
 */

import { create } from 'zustand';
import { bookingAPI } from '../services/api';

export const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  // Create booking
  createBooking: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.createBooking(data);

      set({
        bookings: [response.booking, ...get().bookings],
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Checkout cart
  checkoutCart: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.checkoutCart(data);

      set({
        bookings: [...(response.bookings || []), ...get().bookings],
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create booking payment session
  createBookingPaymentSession: async (id, origin) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.createBookingPaymentSession(id, origin);

      const state = get();
      const updatedBooking = response.booking;
      const updatedBookings = state.bookings.map((b) => (b._id === id ? updatedBooking : b));

      set({
        bookings: updatedBookings,
        currentBooking: updatedBooking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mark booking payment as escrowed
  markBookingPaymentSuccess: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.markBookingPaymentSuccess(id);

      const state = get();
      const updatedBookings = state.bookings.map((b) => (b._id === id ? response.booking : b));

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.getBookingById(id);

      set({
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get my client bookings
  getMyClientBookings: async (query = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.getMyClientBookings(query);

      set({
        bookings: response.bookings,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get my provider bookings
  getMyProviderBookings: async (query = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.getMyProviderBookings(query);

      set({
        bookings: response.bookings,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Confirm booking
  confirmBooking: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.confirmBooking(id);

      const state = get();
      const updatedBookings = state.bookings.map((b) =>
        b._id === id ? response.booking : b
      );

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.cancelBooking(id, { reason });

      const state = get();
      const updatedBookings = state.bookings.map((b) =>
        b._id === id ? response.booking : b
      );

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Complete booking
  completeBooking: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.completeBooking(id);

      const state = get();
      const updatedBookings = state.bookings.map((b) =>
        b._id === id ? response.booking : b
      );

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Release escrow funds
  releaseEscrow: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.releaseEscrow(id);

      const state = get();
      const updatedBookings = state.bookings.map((b) => (b._id === id ? response.booking : b));

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Open escrow dispute
  disputeEscrow: async (id, reason) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.disputeEscrow(id, { reason });

      const state = get();
      const updatedBookings = state.bookings.map((b) => (b._id === id ? response.booking : b));

      set({
        bookings: updatedBookings,
        currentBooking: response.booking,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
