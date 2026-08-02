/**
 * Service Store
 * Global state management for services
 */

import { create } from 'zustand';
import { serviceAPI } from '../services/api';

export const useServiceStore = create((set, get) => ({
  // State
  services: [],
  myServices: [],
  currentService: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Get all services
  getAllServices: async (query = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.getAllServices(query);

      set({
        services: response.services,
        pagination: response.pagination,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.getServiceById(id);

      set({
        currentService: response.service,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get my services
  getMyServices: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.getMyServices();

      set({
        myServices: response.services,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create service
  createService: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.createService(data);

      const state = get();
      set({
        myServices: [...state.myServices, response.service],
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  uploadServiceMedia: async (id, formData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.uploadServiceMedia(id, formData);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update service
  updateService: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.updateService(id, data);

      const state = get();
      const updatedMyServices = state.myServices.map((s) =>
        s._id === id ? response.service : s
      );

      set({
        myServices: updatedMyServices,
        currentService: response.service,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete service
  deleteService: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.deleteService(id);

      const state = get();
      const updatedMyServices = state.myServices.filter((s) => s._id !== id);

      set({
        myServices: updatedMyServices,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Search services
  searchServices: async (query) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.searchServices(query);

      set({
        services: response.services,
        pagination: response.pagination,
        isLoading: false,
      });

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Toggle availability
  toggleAvailability: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await serviceAPI.toggleAvailability(id);

      const state = get();
      const updatedMyServices = state.myServices.map((s) =>
        s._id === id ? response.service : s
      );

      set({
        myServices: updatedMyServices,
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
