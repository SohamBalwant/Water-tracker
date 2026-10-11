/**
 * WaterSaathi - Demo Driver GPS Simulation Engine (Person 3)
 * 
 * Simulates real-time telemetry movement for water tankers along defined
 * municipal routes in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra.
 * 
 * DESIGN REQUIREMENT:
 * Architectural interface complies with standard GPS telemetry contracts
 * so that it can be cleanly swapped with real GPS / hardware OBD / native Geolocation
 * without modifying the booking model or downstream consumers.
 */

import { apiClient } from './apiClient.js';
import { LocationSource } from '../../../../shared/types.js';

// Pre-calculated route waypoints across key demonstration localities in Sambhajinagar
export const DEMO_ROUTES = {
  // Route 1: Cidco N-5 -> TV Centre -> Samarth Nagar -> Kranti Chowk
  ROUTE_CIDCO_CENTRAL: [
    { lat: 19.8762, lng: 75.3433, label: 'Cidco Sector N-5 Water Depot' },
    { lat: 19.8778, lng: 75.3465, label: 'Cidco Cannaught Place' },
    { lat: 19.8795, lng: 75.3490, label: 'TV Centre Square' },
    { lat: 19.8820, lng: 75.3510, label: 'Jalna Road Junction' },
    { lat: 19.8805, lng: 75.3420, label: 'Samarth Nagar West Crossing' },
    { lat: 19.8750, lng: 75.3340, label: 'Kranti Chowk Hub' },
    { lat: 19.8710, lng: 75.3280, label: 'Railway Station Road' },
    { lat: 19.8762, lng: 75.3433, label: 'Return: Cidco Sector N-5 Depot' },
  ],

  // Route 2: Beed Bypass Society Cluster
  ROUTE_BEED_BYPASS: [
    { lat: 19.8650, lng: 75.3450, label: 'Mahanubhav Ashram Depot' },
    { lat: 19.8685, lng: 75.3520, label: 'Beed Bypass Colony A' },
    { lat: 19.8715, lng: 75.3560, label: 'Beed Bypass Colony B' },
    { lat: 19.8740, lng: 75.3620, label: 'Deogiri Hills Enclave' },
    { lat: 19.8700, lng: 75.3580, label: 'Satara Parisar Turn' },
    { lat: 19.8650, lng: 75.3450, label: 'Return: Mahanubhav Ashram Depot' },
  ],
};

/**
 * Calculates straight-line distance in meters between two lat/lng points
 */
function calculateMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing heading in degrees
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  return Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
}

export class TankerSimulationDriver {
  /**
   * @param {Object} options
   * @param {string} options.tankerId - Tanker ID to simulate
   * @param {Array<Object>} [options.route] - Array of {lat, lng, label} waypoints
   * @param {number} [options.updateIntervalMs=3500] - Interval between movement ticks
   * @param {number} [options.stepsBetweenWaypoints=5] - Interpolation resolution
   */
  constructor(options = {}) {
    this.tankerId = options.tankerId || 'tanker-001';
    this.route = options.route || DEMO_ROUTES.ROUTE_CIDCO_CENTRAL;
    this.updateIntervalMs = options.updateIntervalMs || 3500;
    this.stepsBetweenWaypoints = options.stepsBetweenWaypoints || 4;

    this.currentWaypointIndex = 0;
    this.currentStep = 0;
    this.timerId = null;
    this.listeners = new Set();
    this.isPaused = false;
    this.speedKmph = 28; // Plausible urban tanker transit speed

    // Initialize position at first waypoint
    const initial = this.route[0];
    this.currentPosition = {
      latitude: initial.lat,
      longitude: initial.lng,
      label: initial.label,
      headingDeg: 0,
      speedKmph: 0,
      timestamp: new Date().toISOString(),
      locationSource: LocationSource.SIMULATED,
    };
  }

  /**
   * Attach listener for position telemetry events
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Send immediate snapshot
    callback(this.currentPosition);
    return () => this.listeners.delete(callback);
  }

  emit(data) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[DemoDriver] Listener error:', err);
      }
    }
  }

  getCurrentPosition() {
    return { ...this.currentPosition };
  }

  isRunning() {
    return this.timerId !== null && !this.isPaused;
  }

  /**
   * Start or resume simulated movement
   */
  start() {
    if (this.timerId) {
      this.isPaused = false;
      return;
    }

    this.isPaused = false;
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.step();
      }
    }, this.updateIntervalMs);

    // Initial tick
    this.step();
  }

  /**
   * Pause simulation without resetting route progress
   */
  pause() {
    this.isPaused = true;
    this.currentPosition.speedKmph = 0;
    this.emit(this.currentPosition);
  }

  /**
   * Stop simulation and reset to starting position
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPaused = false;
    this.currentWaypointIndex = 0;
    this.currentStep = 0;

    const initial = this.route[0];
    this.currentPosition = {
      latitude: initial.lat,
      longitude: initial.lng,
      label: initial.label,
      headingDeg: 0,
      speedKmph: 0,
      timestamp: new Date().toISOString(),
      locationSource: LocationSource.SIMULATED,
    };
    this.emit(this.currentPosition);
  }

  /**
   * Advances the simulation by a single discrete step
   */
  async step() {
    const nextWaypointIndex = (this.currentWaypointIndex + 1) % this.route.length;
    const fromWp = this.route[this.currentWaypointIndex];
    const toWp = this.route[nextWaypointIndex];

    this.currentStep += 1;
    const progress = this.currentStep / this.stepsBetweenWaypoints;

    // Linear interpolation between waypoints
    const lat = fromWp.lat + (toWp.lat - fromWp.lat) * progress;
    const lng = fromWp.lng + (toWp.lng - fromWp.lng) * progress;
    const heading = calculateBearing(fromWp.lat, fromWp.lng, toWp.lat, toWp.lng);

    if (this.currentStep >= this.stepsBetweenWaypoints) {
      this.currentWaypointIndex = nextWaypointIndex;
      this.currentStep = 0;
    }

    const payload = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      label: progress > 0.5 ? toWp.label : fromWp.label,
      headingDeg: heading,
      speedKmph: this.speedKmph,
      timestamp: new Date().toISOString(),
      locationSource: LocationSource.SIMULATED,
      tankerId: this.tankerId,
      progressPercent: Math.round(((this.currentWaypointIndex + progress) / this.route.length) * 100),
    };

    this.currentPosition = payload;
    this.emit(payload);

    // Persist to API client (synchronizes with backend or mock store)
    try {
      await apiClient.updateTankerLocation(this.tankerId, {
        latitude: payload.latitude,
        longitude: payload.longitude,
        locationSource: LocationSource.SIMULATED,
      });
    } catch (err) {
      console.warn('[DemoDriver] Failed to persist location to backend:', err.message);
    }

    return payload;
  }
}

// Global singleton instance for easy cross-component binding in the demo
export const demoDriverInstance = new TankerSimulationDriver();
