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
 * WaterSaathi - Mock API Service
 * 
 * Provides an in-memory & localStorage-backed implementation of the API contract.
 * Enables Person 1 (Resident Web) to function with full fidelity, interactive map updates,
 * demand pooling calculation, and persistent state across browser reloads.
 */

import { initialMockTankers } from '../data/mockTankers.js';
import { initialMockRequests } from '../data/mockRequests.js';
import { initialMockBookings } from '../data/mockBookings.js';

const STORAGE_KEYS = {
  TANKERS: 'watersaathi_mock_tankers_v1',
  REQUESTS: 'watersaathi_mock_requests_v1',
  BOOKINGS: 'watersaathi_mock_bookings_v1',
  REPORTS: 'watersaathi_mock_reports_v1',
};

function loadFromStorage(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Could not load ${key} from storage:`, err);
  }
  return JSON.parse(JSON.stringify(fallback));
}

function saveToStorage(key, data) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`Could not save ${key} to storage:`, err);
  }
}

// State containers
let mockTankers = loadFromStorage(STORAGE_KEYS.TANKERS, initialMockTankers);
let mockRequests = loadFromStorage(STORAGE_KEYS.REQUESTS, initialMockRequests);
let mockBookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, initialMockBookings);

/**
 * Calculates straight line distance (Haversine approximation) in kilometers.
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export const mockApi = {
  /**
   * Resets mock data to seed state (useful for test resets).
   */
  resetData() {
    mockTankers = JSON.parse(JSON.stringify(initialMockTankers));
    mockRequests = JSON.parse(JSON.stringify(initialMockRequests));
    mockBookings = JSON.parse(JSON.stringify(initialMockBookings));
    saveToStorage(STORAGE_KEYS.TANKERS, mockTankers);
    saveToStorage(STORAGE_KEYS.REQUESTS, mockRequests);
    saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings);
  },

  /**
   * GET /tankers?lat={lat}&lng={lng}
   */
  async getTankers({ lat, lng }) {
    await new Promise((resolve) => setTimeout(resolve, 250)); // simulate network latency
    if (lat === undefined || lng === undefined) {
      throw new Error('Missing coordinates for tanker discovery.');
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    // Filter out OFFLINE tankers, compute distance
    const eligible = mockTankers
      .filter((t) => t.status !== 'OFFLINE')
      .map((t) => ({
        ...t,
        distanceKm: calculateDistanceKm(latitude, longitude, t.latitude, t.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { tankers: eligible };
  },

  /**
   * POST /requests
   */
  async createRequest(payload) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const {
      requesterId = 'resident-demo',
      quantityLitres,
      latitude,
      longitude,
      deliveryWindowStart,
      waterType = 'NON_DRINKING',
      address = '',
      locality = '',
    } = payload;

    const qty = Number(quantityLitres);
    if (!qty || qty < 100 || qty > 25000) {
      throw new Error('Quantity must be between 100 and 25,000 litres.');
    }

    // Default rate ₹500/1000L if no specific tanker chosen
    const benchmarkRate = 500;
    const quotedPrice = Math.round((qty / 1000) * benchmarkRate);

    const newRequest = {
      requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      requesterId,
      quantityLitres: qty,
      latitude: Number(latitude),
      longitude: Number(longitude),
      deliveryWindowStart: deliveryWindowStart || new Date().toISOString(),
      waterType,
      status: 'OPEN',
      quotedPrice,
      quotedPricePaise: quotedPrice * 100,
      address,
      locality,
      createdAt: new Date().toISOString(),
    };

    mockRequests.unshift(newRequest);
    saveToStorage(STORAGE_KEYS.REQUESTS, mockRequests);

    return newRequest;
  },

  /**
   * GET /requests/:id
   */
  async getRequest(requestId) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const req = mockRequests.find((r) => r.requestId === requestId);
    if (!req) {
      throw new Error(`Request '${requestId}' not found.`);
    }

    const booking = mockBookings.find((b) => b.requestIds?.includes(requestId)) || null;
    return { request: req, booking };
  },

  /**
   * POST /requests/:id/join-pool
   * Evaluates demand pooling eligibility against other open requests and available tankers.
   */
  async joinPool(requestId) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const primary = mockRequests.find((r) => r.requestId === requestId);
    if (!primary) {
      throw new Error(`Request '${requestId}' not found.`);
    }

    // Find other compatible requests in OPEN status
    const primaryWindow = new Date(primary.deliveryWindowStart).getTime();

    const compatibleNeighbors = mockRequests.filter((r) => {
      if (r.requestId === primary.requestId) return false;
      if (r.status !== 'OPEN') return false;
      if (r.waterType !== primary.waterType) return false;

      const dist = calculateDistanceKm(primary.latitude, primary.longitude, r.latitude, r.longitude);
      if (dist > 3.0) return false; // Within 3km

      const rWindow = new Date(r.deliveryWindowStart).getTime();
      const diffMinutes = Math.abs(rWindow - primaryWindow) / (1000 * 60);
      return diffMinutes <= 120; // Within 2 hours
    });

    if (compatibleNeighbors.length === 0) {
      return {
        eligible: false,
        message: 'No compatible nearby water requests currently open for pooling in your delivery window.',
      };
    }

    const matchedRequest = compatibleNeighbors[0];
    const combinedQuantityLitres = primary.quantityLitres + matchedRequest.quantityLitres;

    // Check if an available tanker can carry this combined load
    const suitableTanker = mockTankers.find(
      (t) =>
        t.status === 'AVAILABLE' &&
        t.availableLitres >= combinedQuantityLitres &&
        t.waterType === primary.waterType
    ) || mockTankers.find((t) => t.status === 'AVAILABLE' && t.availableLitres >= combinedQuantityLitres);

    if (!suitableTanker) {
      return {
        eligible: false,
        message: `Found compatible demand in your area (${combinedQuantityLitres}L total), but no single available tanker currently has capacity to carry both orders.`,
      };
    }

    // Proportional quote with 5% discount coordination bonus
    const singleTripPrice = Math.round((primary.quantityLitres / 1000) * suitableTanker.pricePer1000Litres);
    const discountedRate = suitableTanker.pricePer1000Litres * 0.95;
    const pooledQuotedPrice = Math.round((primary.quantityLitres / 1000) * discountedRate);
    const savingsInr = singleTripPrice - pooledQuotedPrice;

    // Create a candidate booking in MATCHED status
    const candidateBookingId = `book-pool-${Date.now()}`;
    const newBooking = {
      bookingId: candidateBookingId,
      tankerId: suitableTanker.tankerId,
      requestIds: [primary.requestId, matchedRequest.requestId],
      quotedPrice: pooledQuotedPrice + Math.round((matchedRequest.quantityLitres / 1000) * discountedRate),
      deliveryWindowStart: primary.deliveryWindowStart,
      status: 'MATCHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBookings.push(newBooking);
    saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings);

    // Update statuses of both requests to MATCHED
    primary.status = 'MATCHED';
    matchedRequest.status = 'MATCHED';
    saveToStorage(STORAGE_KEYS.REQUESTS, mockRequests);

    return {
      eligible: true,
      candidateBookingId,
      candidateTankerId: suitableTanker.tankerId,
      candidateTankerName: suitableTanker.displayName,
      combinedQuantityLitres,
      quotedPrice: pooledQuotedPrice,
      savingsInr,
      matchedRequestsCount: 2,
      matchedRequestIds: [primary.requestId, matchedRequest.requestId],
      message: `A compatible shared delivery is available in your locality with ${suitableTanker.displayName}.`,
    };
  },

  /**
   * GET /bookings
   */
  async getBookings() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { bookings: [...mockBookings] };
  },

  /**
   * POST /bookings/:id/accept
   */
  async acceptBooking(bookingId) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const b = mockBookings.find((x) => x.bookingId === bookingId);
    if (!b) throw new Error(`Booking '${bookingId}' not found.`);

    b.status = 'ACCEPTED';
    b.updatedAt = new Date().toISOString();

    const tanker = mockTankers.find((t) => t.tankerId === b.tankerId);
    if (tanker) {
      tanker.status = 'BUSY';
    }

    saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings);
    saveToStorage(STORAGE_KEYS.TANKERS, mockTankers);

    return { message: 'Booking accepted successfully.', booking: b, tanker };
  },

  /**
   * POST /bookings/:id/status
   */
  async updateBookingStatus(bookingId, status) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const b = mockBookings.find((x) => x.bookingId === bookingId);
    if (!b) throw new Error(`Booking '${bookingId}' not found.`);

    b.status = status;
    b.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings);

    return { message: `Status updated to ${status}`, booking: b };
  },

  /**
   * POST /tankers/:id/location
   */
  async updateTankerLocation(tankerId, { latitude, longitude, locationSource = 'SIMULATED' }) {
    const t = mockTankers.find((item) => item.tankerId === tankerId);
    if (!t) throw new Error(`Tanker '${tankerId}' not found.`);

    t.latitude = Number(latitude);
    t.longitude = Number(longitude);
    t.locationSource = locationSource;
    t.lastLocationUpdate = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.TANKERS, mockTankers);

    return t;
  },
};
