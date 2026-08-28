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

  // Checkout cart into bookings
  checkoutCart: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.checkoutCart(data);
      set({ isLoading: false });
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

  // Reject booking (provider)
  rejectBooking: async (id, reason) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.rejectBooking(id, { reason });
      const state = get();
      set({
        bookings: state.bookings.map((b) => (b._id === id ? response.booking : b)),
        currentBooking: response.booking,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Confirm booking
  confirmBooking: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.confirmBooking(id, data);

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

  // Create payment session
  createBookingPaymentSession: async (id, origin, gateway) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.createBookingPaymentSession(id, origin, gateway);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Release escrow
  releaseEscrow: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.releaseEscrow(id);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Dispute escrow
  disputeEscrow: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.disputeEscrow(id, data);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mark payment as successful and escrow the funds
  markBookingPaymentSuccess: async (id, paymentType = 'full') => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.markBookingPaymentSuccess(id, paymentType);
      const state = get();
      const updatedBookings = state.bookings.map((b) => b._id === id ? response.booking : b);
      set({ bookings: updatedBookings, currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  checkAvailability: async (params) => {
    try {
      const response = await bookingAPI.checkAvailability(params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  requestReschedule: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.requestReschedule(id, data);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  respondReschedule: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.respondReschedule(id, data);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  requestRefund: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.requestRefund(id, data);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  respondRefund: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.respondRefund(id, data);
      set({ currentBooking: response.booking, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  payBalance: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingAPI.payBalance(id, data);
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
