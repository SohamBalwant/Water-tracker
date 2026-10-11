/**
 * WaterSaathi - Unified HTTP API Client
 * 
 * Bridges frontend pages to either the live AWS/Local HTTP API Gateway
 * or the client-side mockApi according to VITE_USE_MOCK_API.
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
  },
};
