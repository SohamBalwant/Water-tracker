import React from 'react';

export function ActiveTripBanner({ activeBooking, tanker, onCompleteDelivery }) {
  if (!activeBooking && tanker?.status !== 'EN_ROUTE') return null;

  return (
    <div className="active-trip-banner">
      <div className="active-trip-content">
        <div className="pulse-indicator">
          <span className="pulse-dot" />
          <span className="pulse-label">ACTIVE TRIP IN PROGRESS</span>
        </div>
        <div className="active-trip-details">
          <strong>Tanker: {tanker?.displayName || 'Active Tanker'}</strong> &bull;{' '}
          {activeBooking ? (
            <span>
              Booking #{activeBooking.bookingId} ({activeBooking.totalQuantityLitres || activeBooking.quotedPrice}L / {activeBooking.requests?.length || 1} Stop(s))
            </span>
          ) : (
            <span>Tanker marked EN ROUTE</span>
          )}
        </div>
      </div>

      {activeBooking && (
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={() => onCompleteDelivery(activeBooking.bookingId)}
        >
          ✓ Mark Delivered
        </button>
      )}
    </div>
  );
}
