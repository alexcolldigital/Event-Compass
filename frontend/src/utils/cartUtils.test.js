import { normalizeCartItem } from './cartUtils';

describe('normalizeCartItem', () => {
  it('turns a service into a backend-safe cart item with quantity and pricing', () => {
    const item = normalizeCartItem(
      {
        _id: 'svc_123',
        name: 'Luxury DJ Set',
        category: 'DJ/Music',
        pricing: { basePrice: 25000 },
        images: [{ url: 'https://example.com/dj.jpg' }],
        unit: 'booking',
      },
      2
    );

    expect(item).toMatchObject({
      serviceId: 'svc_123',
      name: 'Luxury DJ Set',
      price: 25000,
      quantity: 2,
      image: 'https://example.com/dj.jpg',
      unit: 'booking',
    });
  });
});
