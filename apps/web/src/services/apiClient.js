/**
 * WaterSaathi - Unified HTTP API Client
 * 
 * Bridges frontend pages to either the live AWS/Local HTTP API Gateway
 * or the client-side mockApi according to VITE_USE_MOCK_API.
 * Routes requests to either the live backend REST API (AWS API Gateway or local server)
 * or the in-memory mock client based on VITE_USE_MOCK_API flag.
 */

import { mockApi } from './mockApi.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';
const FORCE_MOCK = import.meta.env?.VITE_USE_MOCK_API !== 'false';

async function request(endpoint, options = {}) {
  if (FORCE_MOCK) {
    return null; // Will trigger mock fallback
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    // If backend is unreachable and not explicitly strict, fallback to mock with warning
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      console.warn(`[WaterSaathi API] Backend at ${url} unreachable. Falling back to local mock data.`);
      return null;
    }
    throw err;
  }
}

export const apiClient = {
  isMockMode() {
    return FORCE_MOCK;
  },

  resetDemo() {
    return mockApi.reset();
  },

  async getTankers(params = { lat: 19.8762, lng: 75.3433 }) {
    if (!FORCE_MOCK) {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/tankers?${query}`);
      if (res) return res;
    }
    return mockApi.getTankers(params);
  },

  async updateTankerLocation(tankerId, payload) {
    if (!FORCE_MOCK) {
      const res = await request(`/tankers/${tankerId}/location`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res) return res;
    }
    return mockApi.updateTankerLocation(tankerId, payload);
  },

  async updateTankerStatus(tankerId, status) {
    return mockApi.updateTankerStatus(tankerId, status);
  },

  async getBookings() {
    if (!FORCE_MOCK) {
      const res = await request('/bookings');
      if (res) return res;
    }
    return mockApi.getBookings();
  },

  async acceptBooking(bookingId) {
    if (!FORCE_MOCK) {
      const res = await request(`/bookings/${bookingId}/accept`, {
        method: 'POST',
      });
      if (res) return res;
    }
    return mockApi.acceptBooking(bookingId);
  },

  async rejectBooking(bookingId, reason) {
    if (!FORCE_MOCK) {
      const res = await request(`/bookings/${bookingId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (res) return res;
    }
    return mockApi.rejectBooking(bookingId, reason);
  },

  async updateBookingStatus(bookingId, status) {
    if (!FORCE_MOCK) {
      const res = await request(`/bookings/${bookingId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      if (res) return res;
    }
    return mockApi.updateBookingStatus(bookingId, status);
  },

  async getShortageReports() {
    if (!FORCE_MOCK) {
      const res = await request('/admin/shortage-reports');
      if (res) return res;
    }
    return mockApi.getShortageReports();
  },

  async createShortageReport(payload) {
    if (!FORCE_MOCK) {
      const res = await request('/shortage-reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res) return res;
    }
    return mockApi.createShortageReport(payload);
  },

  async updateReportStatus(reportId, status) {
    if (!FORCE_MOCK) {
      const res = await request(`/admin/shortage-reports/${reportId}/status`, {
        method: 'POST',
        body: JSON.stringify({ verificationStatus: status }),
      });
      if (res) return res;
    }
    return mockApi.updateReportStatus(reportId, status);
  },

  async createRequest(payload) {
    if (!FORCE_MOCK) {
      const res = await request('/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res) return res;
    }
    return mockApi.createRequest(payload);
  },

  async joinPool(requestId) {
    if (!FORCE_MOCK) {
      const res = await request(`/requests/${requestId}/join-pool`, {
        method: 'POST',
      });
      if (res) return res;
    }
    return mockApi.joinPool(requestId);
  },

  async getRequests() {
    return mockApi.getRequests();
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
