/**
 * WaterSaathi - Unified HTTP API Client
 * 
 * Routes requests to either the live backend REST API (AWS API Gateway or local server)
 * or the in-memory mock client based on VITE_USE_MOCK_API flag.
 */

import { mockApi } from './mockApi.js';

const env =
  typeof import.meta !== 'undefined' && import.meta?.env
    ? import.meta.env
    : (typeof process !== 'undefined' && process.env ? process.env : {});

const USE_MOCK_API = env.VITE_USE_MOCK_API !== 'false';
const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:3001';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errMessage = `HTTP error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.error?.message) errMessage = errData.error.message;
    } catch (_) {}
    throw new Error(errMessage);
  }

  return response.json();
}

export const apiClient = {
  isMockMode: USE_MOCK_API,

  async getTankers({ lat, lng }) {
    if (USE_MOCK_API) {
      return mockApi.getTankers({ lat, lng });
    }
    return fetchJson(`/tankers?lat=${lat}&lng=${lng}`);
  },

  async createRequest(payload) {
    if (USE_MOCK_API) {
      return mockApi.createRequest(payload);
    }
    return fetchJson('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRequest(requestId) {
    if (USE_MOCK_API) {
      return mockApi.getRequest(requestId);
    }
    return fetchJson(`/requests/${requestId}`);
  },

  async joinPool(requestId) {
    if (USE_MOCK_API) {
      return mockApi.joinPool(requestId);
    }
    return fetchJson(`/requests/${requestId}/join-pool`, {
      method: 'POST',
    });
  },

  async getBookings() {
    if (USE_MOCK_API) {
      return mockApi.getBookings();
    }
    return fetchJson('/bookings');
  },

  async acceptBooking(bookingId) {
    if (USE_MOCK_API) {
      return mockApi.acceptBooking(bookingId);
    }
    return fetchJson(`/bookings/${bookingId}/accept`, {
      method: 'POST',
    });
  },

  async updateBookingStatus(bookingId, status) {
    if (USE_MOCK_API) {
      return mockApi.updateBookingStatus(bookingId, status);
    }
    return fetchJson(`/bookings/${bookingId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async updateTankerLocation(tankerId, coords) {
    if (USE_MOCK_API) {
      return mockApi.updateTankerLocation(tankerId, coords);
    }
    return fetchJson(`/tankers/${tankerId}/location`, {
      method: 'POST',
      body: JSON.stringify(coords),
    });
  },
};
