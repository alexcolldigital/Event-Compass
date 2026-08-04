export const BOOKING_POLICY_ITEMS = [
  {
    id: 'terms',
    title: 'Rental terms',
    description: 'Bookings are confirmed only after the provider accepts the request and the payment is secured in escrow.',
  },
  {
    id: 'privacy',
    title: 'Privacy & data',
    description: 'Your event details are used to coordinate the booking and improve service quality only.',
  },
  {
    id: 'disclaimer',
    title: 'Service disclaimer',
    description: 'Both parties agree to the Event Compass marketplace policy for communication, confirmation, and dispute handling.',
  },
];

export const isBookingPolicyAccepted = (accepted) => Boolean(accepted);
