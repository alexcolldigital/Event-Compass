export const BOOKING_POLICY_ITEMS = [
  {
    id: 'terms',
    title: 'Terms & Conditions',
    text:
      'Bookings are subject to availability and must be confirmed by the service provider. You agree to provide accurate event details, honor the agreed date and time, and pay any confirmed charges in line with the provider\'s quoted pricing.',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    text:
      'Your personal data, contact details, and booking information are used to process reservations, communicate updates, and improve service delivery. We will not share your information with third parties except as required to complete the booking or comply with the law.',
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    text:
      'Event Compass helps connect customers with service providers, but we are not responsible for the quality, safety, or outcome of third-party services. Any disputes regarding delivery, conduct, or event execution should be resolved directly with the provider.',
  },
];

export const isBookingPolicyAccepted = (value) => value === true;
