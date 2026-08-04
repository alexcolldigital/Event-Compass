import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((entry) => entry.serviceId === item.serviceId);
    if (existing) {
      set({
        items: get().items.map((entry) =>
          entry.serviceId === item.serviceId ? { ...entry, quantity: entry.quantity + (item.quantity || 1) } : entry
        ),
      });
      return;
    }

    set({ items: [...get().items, { ...item, quantity: item.quantity || 1 }] });
  },
  removeItem: (serviceId) => set({ items: get().items.filter((item) => item.serviceId !== serviceId) }),
  clearCart: () => set({ items: [] }),
  updateQuantity: (serviceId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(serviceId);
      return;
    }

    set({
      items: get().items.map((item) => (item.serviceId === serviceId ? { ...item, quantity } : item)),
    });
  },
}));
