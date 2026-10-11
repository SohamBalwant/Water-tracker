import { BookingStatus } from '../../../../shared/types.js';

export const mockBookings = [
  {
    bookingId: 'booking-001',
    tankerId: 'tanker-004',
    requestIds: ['request-003'],
    quotedPrice: 1560,
    finalPrice: 1560,
    deliveryWindowStart: '2026-10-11T11:00:00.000Z',
    status: BookingStatus.ACCEPTED,
    createdAt: '2026-10-11T07:30:00.000Z',
    updatedAt: '2026-10-11T08:00:00.000Z',
  },
  {
    bookingId: 'booking-002',
    tankerId: 'tanker-006',
    requestIds: ['request-004', 'request-005'],
    quotedPrice: 2280,
    finalPrice: 2280,
    deliveryWindowStart: '2026-10-11T12:30:00.000Z',
    status: BookingStatus.EN_ROUTE,
    createdAt: '2026-10-11T07:45:00.000Z',
    updatedAt: '2026-10-11T08:15:00.000Z',
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
