/**
 * WaterSaathi - Client-Side Mock API Service
 * 
 * Implements identical signatures and response shapes to the backend HTTP API.
 * Uses sessionStorage (with fallback to memory) to persist state during demo interactions.
 */

import { mockTankers } from '../data/mockTankers.js';
import { mockRequests } from '../data/mockRequests.js';
import { mockBookings } from '../data/mockBookings.js';
import { mockReports } from '../data/mockReports.js';
import {
  TankerStatus,
  BookingStatus,
  RequestStatus,
  ShortageReportStatus,
} from '../../../../shared/types.js';

const STORAGE_KEY = 'watersaathi_mock_state_v1';

function loadInitialState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // sessionStorage unavailable or restricted
  }
  return {
    tankers: JSON.parse(JSON.stringify(mockTankers)),
    requests: JSON.parse(JSON.stringify(mockRequests)),
    bookings: JSON.parse(JSON.stringify(mockBookings)),
    reports: JSON.parse(JSON.stringify(mockReports)),
  };
}

let state = loadInitialState();

function persistState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

export const mockApi = {
  reset() {
    state = {
      tankers: JSON.parse(JSON.stringify(mockTankers)),
      requests: JSON.parse(JSON.stringify(mockRequests)),
      bookings: JSON.parse(JSON.stringify(mockBookings)),
      reports: JSON.parse(JSON.stringify(mockReports)),
    };
    persistState();
    return true;
  },

  async getTankers({ lat, lng } = {}) {
    await new Promise(r => setTimeout(r, 40));
    // Return all tankers for map / discovery, matching backend
    return { tankers: [...state.tankers] };
  },

  async getTanker(tankerId) {
    await new Promise(r => setTimeout(r, 30));
    const tanker = state.tankers.find(t => t.tankerId === tankerId);
    if (!tanker) throw new Error(`Tanker ${tankerId} not found`);
    return { tanker: { ...tanker } };
  },

  async updateTankerLocation(tankerId, { latitude, longitude, locationSource = 'SIMULATED' }) {
    await new Promise(r => setTimeout(r, 30));
    const index = state.tankers.findIndex(t => t.tankerId === tankerId);
    if (index === -1) throw new Error(`Tanker ${tankerId} not found`);

    state.tankers[index] = {
      ...state.tankers[index],
      latitude: Number(latitude),
      longitude: Number(longitude),
      locationSource,
      lastLocationUpdate: new Date().toISOString(),
    };
    persistState();
    return { ...state.tankers[index] };
  },

  async updateTankerStatus(tankerId, status) {
    await new Promise(r => setTimeout(r, 30));
    const index = state.tankers.findIndex(t => t.tankerId === tankerId);
    if (index === -1) throw new Error(`Tanker ${tankerId} not found`);

    if (!Object.values(TankerStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    state.tankers[index] = {
      ...state.tankers[index],
      status,
      lastLocationUpdate: new Date().toISOString(),
    };
    persistState();
    return { tanker: { ...state.tankers[index] } };
  },

  async getBookings() {
    await new Promise(r => setTimeout(r, 40));
    return { bookings: [...state.bookings] };
  },

  async getBooking(bookingId) {
    await new Promise(r => setTimeout(r, 30));
    const booking = state.bookings.find(b => b.bookingId === bookingId);
    if (!booking) throw new Error(`Booking ${bookingId} not found`);
    return { booking: { ...booking } };
  },

  async acceptBooking(bookingId) {
    await new Promise(r => setTimeout(r, 50));
    const bookingIndex = state.bookings.findIndex(b => b.bookingId === bookingId);
    if (bookingIndex === -1) throw new Error(`Booking ${bookingId} not found`);

    const booking = state.bookings[bookingIndex];
    if (booking.status !== BookingStatus.OPEN && booking.status !== BookingStatus.MATCHED) {
      throw new Error(`Booking in ${booking.status} cannot be accepted.`);
    }

    const tankerIndex = state.tankers.findIndex(t => t.tankerId === booking.tankerId);
    if (tankerIndex === -1) throw new Error('Assigned tanker not found.');

    const tanker = state.tankers[tankerIndex];
    if (tanker.status === TankerStatus.OFFLINE) {
      throw new Error('Assigned tanker is currently OFFLINE.');
    }

    const updatedBooking = {
      ...booking,
      status: BookingStatus.ACCEPTED,
      updatedAt: new Date().toISOString(),
    };
    state.bookings[bookingIndex] = updatedBooking;

    // Transition tanker status to BUSY
    state.tankers[tankerIndex] = {
      ...tanker,
      status: TankerStatus.BUSY,
    };

    // Transition associated requests to ACCEPTED
    for (const reqId of booking.requestIds || []) {
      const rIdx = state.requests.findIndex(r => r.requestId === reqId);
      if (rIdx !== -1) {
        state.requests[rIdx] = {
          ...state.requests[rIdx],
          status: RequestStatus.ACCEPTED,
          bookingId,
        };
      }
    }

    persistState();
    return {
      message: 'Booking accepted successfully.',
      booking: updatedBooking,
      tanker: state.tankers[tankerIndex],
    };
  },

  async rejectBooking(bookingId, reason = 'Operator rejected assignment') {
    await new Promise(r => setTimeout(r, 50));
    const bookingIndex = state.bookings.findIndex(b => b.bookingId === bookingId);
    if (bookingIndex === -1) throw new Error(`Booking ${bookingId} not found`);

    const booking = state.bookings[bookingIndex];
    state.bookings[bookingIndex] = {
      ...booking,
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    };

    persistState();
    return {
      message: 'Booking rejected.',
      booking: state.bookings[bookingIndex],
    };
  },

  async updateBookingStatus(bookingId, status) {
    await new Promise(r => setTimeout(r, 50));
    const bookingIndex = state.bookings.findIndex(b => b.bookingId === bookingId);
    if (bookingIndex === -1) throw new Error(`Booking ${bookingId} not found`);

    const booking = state.bookings[bookingIndex];

    // Status transition validation
    const allowed = {
      [BookingStatus.ACCEPTED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED],
      [BookingStatus.EN_ROUTE]: [BookingStatus.DELIVERED, BookingStatus.CANCELLED],
      [BookingStatus.MATCHED]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
      [BookingStatus.OPEN]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
    };

    if (allowed[booking.status] && !allowed[booking.status].includes(status)) {
      throw new Error(`Cannot transition booking from ${booking.status} to ${status}`);
    }

    const updatedBooking = {
      ...booking,
      status,
      updatedAt: new Date().toISOString(),
    };
    state.bookings[bookingIndex] = updatedBooking;

    // Synchronize tanker status
    const tankerIndex = state.tankers.findIndex(t => t.tankerId === booking.tankerId);
    if (tankerIndex !== -1) {
      if (status === BookingStatus.EN_ROUTE) {
        state.tankers[tankerIndex].status = TankerStatus.EN_ROUTE;
      } else if (status === BookingStatus.DELIVERED) {
        state.tankers[tankerIndex].status = TankerStatus.AVAILABLE;
      }
    }

    // Synchronize request statuses
    for (const reqId of booking.requestIds || []) {
      const rIdx = state.requests.findIndex(r => r.requestId === reqId);
      if (rIdx !== -1) {
        state.requests[rIdx].status = status;
      }
    }

    persistState();
    return {
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    };
  },

  async getShortageReports() {
    await new Promise(r => setTimeout(r, 40));
    return { reports: [...state.reports] };
  },

  async createShortageReport(payload) {
    await new Promise(r => setTimeout(r, 50));
    const report = {
      reportId: `report-${Date.now()}`,
      reporterId: payload.reporterId || 'resident-anon',
      locality: payload.locality,
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      description: payload.description,
      reportedAt: new Date().toISOString(),
      verificationStatus: ShortageReportStatus.UNVERIFIED,
    };
    state.reports.unshift(report);
    persistState();
    return { ...report };
  },

  async updateReportStatus(reportId, verificationStatus) {
    await new Promise(r => setTimeout(r, 40));
    const idx = state.reports.findIndex(r => r.reportId === reportId);
    if (idx === -1) throw new Error(`Report ${reportId} not found`);

    if (!Object.values(ShortageReportStatus).includes(verificationStatus)) {
      throw new Error(`Invalid report verification status: ${verificationStatus}`);
    }

    state.reports[idx] = {
      ...state.reports[idx],
      verificationStatus,
      updatedAt: new Date().toISOString(),
    };
    persistState();
    return { report: state.reports[idx] };
  },

  async getRequests() {
    await new Promise(r => setTimeout(r, 30));
    return { requests: [...state.requests] };
  },

  async createRequest(payload) {
    await new Promise(r => setTimeout(r, 50));
    const requestId = `request-${Date.now()}`;
    const quotedPrice = Math.round((Number(payload.quantityLitres) / 1000) * 500);
    const req = {
      requestId,
      requesterId: payload.requesterId || 'resident-demo',
      locality: payload.locality || 'Cidco Sector N-5',
      quantityLitres: Number(payload.quantityLitres),
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      deliveryWindowStart: payload.deliveryWindowStart,
      waterType: payload.waterType || 'NON_DRINKING',
      status: RequestStatus.OPEN,
      quotedPrice,
      createdAt: new Date().toISOString(),
    };
    state.requests.unshift(req);
    persistState();
    return { ...req };
  },

  async joinPool(requestId) {
    await new Promise(r => setTimeout(r, 60));
    const req = state.requests.find(r => r.requestId === requestId);
    if (!req) throw new Error('Request not found');

    const others = state.requests.filter(r => r.requestId !== requestId && r.status === RequestStatus.OPEN);
    if (others.length === 0) {
      return {
        eligible: false,
        message: 'No compatible nearby water requests currently open for pooling in your delivery window.',
      };
    }

    const matched = others[0];
    const combinedQuantity = req.quantityLitres + matched.quantityLitres;
    const candidateBookingId = `book-pool-${Date.now()}`;
    const candidateBooking = {
      bookingId: candidateBookingId,
      tankerId: 'tanker-001',
      requestIds: [req.requestId, matched.requestId],
      quotedPrice: Math.round((combinedQuantity / 1000) * 475),
      deliveryWindowStart: req.deliveryWindowStart,
      status: BookingStatus.MATCHED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.bookings.unshift(candidateBooking);
    req.status = RequestStatus.MATCHED;
    req.bookingId = candidateBookingId;
    matched.status = RequestStatus.MATCHED;
    matched.bookingId = candidateBookingId;
    persistState();

    return {
      eligible: true,
      candidateBookingId,
      combinedQuantityLitres: combinedQuantity,
      quotedPrice: candidateBooking.quotedPrice,
      message: 'A compatible neighborhood delivery was found and matched.',
    };
  },
};
