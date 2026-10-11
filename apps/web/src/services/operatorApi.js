/**
 * WaterSaathi - Operator & Admin Service Layer (Person 3)
 * 
 * Provides domain actions for tanker fleet management, dispatching,
 * booking approvals, trip status tracking, and community report audits.
 */

import { apiClient } from './apiClient.js';
import {
  TankerStatus,
  BookingStatus,
  ShortageReportStatus,
} from '../../../../shared/types.js';

export const operatorApi = {
  /**
   * Retrieves all tankers, optionally filtered by operatorId
   */
  async getTankers(operatorId = null) {
    const res = await apiClient.getTankers();
    const tankers = res?.tankers || [];
    if (!operatorId) return tankers;
    return tankers.filter(t => t.operatorId === operatorId);
  },

  /**
   * Retrieves bookings assigned or available to an operator / tanker
   */
  async getBookings({ operatorId = null, tankerId = null } = {}) {
    const [bookingsRes, tankersRes, requestsRes] = await Promise.all([
      apiClient.getBookings(),
      apiClient.getTankers(),
      apiClient.getRequests(),
    ]);

    let bookings = bookingsRes?.bookings || [];
    const tankers = tankersRes?.tankers || [];
    const requests = requestsRes?.requests || [];

    // Map associated requests and tanker metadata to each booking
    const enriched = bookings.map(b => {
      const tanker = tankers.find(t => t.tankerId === b.tankerId);
      const bookingRequests = (b.requestIds || []).map(id => requests.find(r => r.requestId === id)).filter(Boolean);
      return {
        ...b,
        tanker,
        requests: bookingRequests,
        totalQuantityLitres: bookingRequests.reduce((sum, r) => sum + (r.quantityLitres || 0), 0),
        isPooled: (b.requestIds || []).length > 1,
      };
    });

    if (tankerId) {
      return enriched.filter(b => b.tankerId === tankerId);
    }
    if (operatorId) {
      return enriched.filter(b => b.tanker?.operatorId === operatorId);
    }
    return enriched;
  },

  /**
   * Accepts a pending booking assignment
   */
  async acceptBooking(bookingId) {
    return apiClient.acceptBooking(bookingId);
  },

  /**
   * Rejects an assigned booking with a reason
   */
  async rejectBooking(bookingId, reason = 'Operator declined') {
    return apiClient.rejectBooking(bookingId, reason);
  },

  /**
   * Advances booking lifecycle (e.g. ACCEPTED -> EN_ROUTE -> DELIVERED)
   */
  async updateBookingStatus(bookingId, status) {
    return apiClient.updateBookingStatus(bookingId, status);
  },

  /**
   * Updates tanker availability status
   */
  async updateTankerStatus(tankerId, status) {
    return apiClient.updateTankerStatus(tankerId, status);
  },

  /**
   * Updates tanker coordinates
   */
  async updateTankerLocation(tankerId, { latitude, longitude, locationSource = 'SIMULATED' }) {
    return apiClient.updateTankerLocation(tankerId, { latitude, longitude, locationSource });
  },

  /**
   * Retrieves all community shortage reports for administration
   */
  async getShortageReports() {
    const res = await apiClient.getShortageReports();
    return res?.reports || [];
  },

  /**
   * Updates verification status for a shortage report
   */
  async updateReportStatus(reportId, status) {
    return apiClient.updateReportStatus(reportId, status);
  },

  /**
   * Aggregates fleet statistics for operator and admin dashboards
   */
  async getFleetOverview() {
    const [tankersRes, bookingsRes, reportsRes] = await Promise.all([
      apiClient.getTankers(),
      apiClient.getBookings(),
      apiClient.getShortageReports(),
    ]);

    const tankers = tankersRes?.tankers || [];
    const bookings = bookingsRes?.bookings || [];
    const reports = reportsRes?.reports || [];

    const totalCapacityLitres = tankers.reduce((acc, t) => acc + (t.capacityLitres || 0), 0);
    const availableLitres = tankers.reduce((acc, t) => acc + (t.availableLitres || 0), 0);

    const availableCount = tankers.filter(t => t.status === TankerStatus.AVAILABLE).length;
    const busyCount = tankers.filter(t => t.status === TankerStatus.BUSY).length;
    const enRouteCount = tankers.filter(t => t.status === TankerStatus.EN_ROUTE).length;
    const offlineCount = tankers.filter(t => t.status === TankerStatus.OFFLINE).length;

    // Detect stale locations (> 4 hours without update)
    const now = Date.now();
    const staleTankers = tankers.filter(t => {
      const updateTime = new Date(t.lastLocationUpdate || 0).getTime();
      return (now - updateTime) > 4 * 60 * 60 * 1000;
    });

    // Detect suspicious price discrepancies (< ₹150 or > ₹2000 per 1000L)
    const suspiciousPricingTankers = tankers.filter(t => {
      const price = t.pricePer1000Litres;
      return price < 150 || price > 2000;
    });

    return {
      totalTankers: tankers.length,
      availableCount,
      busyCount,
      enRouteCount,
      offlineCount,
      totalCapacityLitres,
      availableLitres,
      activeBookingsCount: bookings.filter(b => b.status === BookingStatus.ACCEPTED || b.status === BookingStatus.EN_ROUTE).length,
      deliveredBookingsCount: bookings.filter(b => b.status === BookingStatus.DELIVERED).length,
      totalReportsCount: reports.length,
      unverifiedReportsCount: reports.filter(r => r.verificationStatus === ShortageReportStatus.UNVERIFIED).length,
      staleTankersCount: staleTankers.length,
      staleTankers,
      suspiciousPricingTankers,
    };
  },
};
