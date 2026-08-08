export const normalizeCartItem = (service, quantity = 1) => {
  if (!service) {
    return null;
  }

  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const basePrice = Number(service.pricing?.basePrice ?? service.price ?? 0);

  return {
    serviceId: service._id || service.id || service.serviceId,
    name: service.name || 'Service',
    category: service.category || service.serviceType || 'General',
    price: basePrice,
    quantity: normalizedQuantity,
    image: service.images?.[0]?.url || service.image || '',
    unit: service.unit || service.pricing?.unit || 'booking',
    specialRequirements: service.specialRequirements || '',
    bookingLocation: service.bookingLocation || null,
  };
};

export const buildCheckoutBookingDetails = (overrides = {}) => ({
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  eventTime: '12:00',
  duration: 1,
  numberOfGuests: 1,
  bookingLocation: {
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Ikeja',
    lga: 'Ikeja',
    address: '123 Event Compass Street',
  },
  clientNotes: 'Booking via cart checkout',
  ...overrides,
});
