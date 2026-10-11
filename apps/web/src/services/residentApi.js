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
  },
};
