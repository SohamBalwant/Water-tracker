/**
 * Seed demonstration bookings connecting tankers and water requests.
 */
export const initialMockBookings = [
  {
    bookingId: 'booking-001',
    tankerId: 'tanker-004',
    requestIds: ['request-005'],
    quotedPrice: 2080,
    finalPrice: 2080,
    deliveryWindowStart: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(),
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    bookingId: 'booking-002',
    tankerId: 'tanker-005',
    requestIds: ['request-003'],
    quotedPrice: 1440,
    finalPrice: 1440,
    deliveryWindowStart: new Date(Date.now() + 1000 * 60 * 60 * 0.5).toISOString(),
    status: 'EN_ROUTE',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];
