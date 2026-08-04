import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((cartItem) => cartItem.serviceId === item.serviceId);
      if (existing) {
        return {
          items: state.items.map((cartItem) =>
            cartItem.serviceId === item.serviceId
              ? { ...cartItem, quantity: (cartItem.quantity || 1) + (item.quantity || 1) }
              : cartItem
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
    });
  },
  updateItemQuantity: (serviceId, quantity) => {
    set((state) => ({
      items: state.items.map((cartItem) =>
        cartItem.serviceId === serviceId ? { ...cartItem, quantity: Math.max(1, quantity) } : cartItem
      ),
    }));
  },
  removeItem: (serviceId) => {
    set((state) => ({
      items: state.items.filter((cartItem) => cartItem.serviceId !== serviceId),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalAmount: () => get().items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
}));
