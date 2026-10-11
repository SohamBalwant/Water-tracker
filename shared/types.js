/**
 * WaterSaathi - Shared Types, Enums and Constants
 * 
 * Shared contract across frontend (Resident, Operator, Admin)
 * and serverless backend services.
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
}
