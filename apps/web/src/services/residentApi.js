/**
 * WaterSaathi - Resident API Service Adapter (Person 1 Interface)
 * 
 * Provides clean contracts for resident discovery, request creation,
 * demand pooling, and status tracking.
 */

import { apiClient } from './apiClient.js';

export const residentApi = {
  async getNearbyTankers(lat = 19.8762, lng = 75.3433) {
    const res = await apiClient.getTankers({ lat, lng });
    return res?.tankers || [];
  },

  async createWaterRequest(payload) {
    return apiClient.createRequest(payload);
  },

  async getRequest(requestId) {
    // In mock or backend client
    const all = await apiClient.getRequests();
    const match = all.find(r => r.requestId === requestId);
    if (!match) throw new Error('Request not found');
    return match;
  },

  async joinPool(requestId) {
    return apiClient.joinPool(requestId);
  },

  async reportWaterShortage(payload) {
    return apiClient.createShortageReport(payload);
 * WaterSaathi - Resident API Service Layer (Person 1 Ownership)
 * 
 * Provides clean abstractions for the resident discovery, booking, pooling,
 * and tracking workflows. Backed by apiClient (mock or live backend).
 */

import { apiClient } from './apiClient.js';
import { mockApi } from './mockApi.js';

export const residentApi = {
  isMockMode: apiClient.isMockMode,

  /**
   * Fetches nearby available water tankers for given geographical coordinates.
   */
  async getNearbyTankers(latitude, longitude) {
    const data = await apiClient.getTankers({ lat: latitude, lng: longitude });
    return data.tankers || [];
  },

  /**
   * Submits a new water delivery request.
   */
  async submitWaterRequest({
    requesterId = 'resident-demo',
    quantityLitres,
    latitude,
    longitude,
    deliveryWindowStart,
    waterType = 'NON_DRINKING',
    address = '',
    locality = '',
  }) {
    return apiClient.createRequest({
      requesterId,
      quantityLitres: Number(quantityLitres),
      latitude: Number(latitude),
      longitude: Number(longitude),
      deliveryWindowStart,
      waterType,
      address,
      locality,
    });
  },

  /**
   * Fetches details and status for an existing water request and its linked booking.
   */
  async getRequestDetails(requestId) {
    return apiClient.getRequest(requestId);
  },

  /**
   * Checks for nearby compatible water requests and evaluates community demand pooling.
   */
  async joinOrCheckPool(requestId) {
    return apiClient.joinPool(requestId);
  },

  /**
   * Fetches bookings associated with the current resident.
   */
  async getResidentBookings() {
    const data = await apiClient.getBookings();
    return data.bookings || [];
  },

  /**
   * Resets mock data to initial demo state.
   */
  resetDemoData() {
    if (apiClient.isMockMode) {
      mockApi.resetData();
    }
  },
};
