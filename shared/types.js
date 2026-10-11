/**
 * WaterSaathi - Shared Types, Enums and Constants
 * 
 * Shared contract across frontend (Resident, Operator, Admin)
 * and serverless backend services.
 * WaterSaathi - Shared Domain Types, Enums, and Utility Functions
 * 
 * Shared across Person 1 (Web UI), Person 2 (Backend API), and Person 3 (Operator/Admin).
 * All services and components must adhere to these contracts without variation.
 */

export const TankerStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  EN_ROUTE: 'EN_ROUTE',
  OFFLINE: 'OFFLINE',
});

export const WaterType = Object.freeze({
  DRINKING: 'DRINKING',
  NON_DRINKING: 'NON_DRINKING',
  UNKNOWN: 'UNKNOWN',
});

export const LocationSource = Object.freeze({
  GPS: 'GPS',
  MANUAL: 'MANUAL',
  SIMULATED: 'SIMULATED',
});

export const VerificationStatus = Object.freeze({
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
});

export const RequestStatus = Object.freeze({
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

export const BookingStatus = Object.freeze({
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

export const ShortageReportStatus = Object.freeze({
  UNVERIFIED: 'UNVERIFIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
});

/**
 * Converts INR to integer paise for reliable monetary persistence.
 * @param {number|string} inr 
 * @returns {number}
 * Currency conversion utilities:
 * Monies are displayed to users in INR and stored in DynamoDB as integer paise.
 */
export function inrToPaise(inr) {
  return Math.round(Number(inr) * 100);
}

/**
 * Converts integer paise to INR decimal for user-facing display.
 * @param {number|string} paise 
 * @returns {number}
 */
export function paiseToInr(paise) {
  return Number((Number(paise) / 100).toFixed(2));
export function paiseToInr(paise) {
  return Number(paise) / 100;
}
