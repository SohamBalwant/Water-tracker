import React, { useState } from 'react';
import { StatusBadge } from '../shared/StatusBadge.jsx';
import { BookingStatus } from '../../shared/types.js';

export function BookingCard({
  booking,
  onAccept,
  onReject,
  onUpdateStatus,
  actionLoading = false,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('Capacity constraint on current trip');

  const {
    bookingId,
    tankerId,
    status,
    quotedPrice,
    deliveryWindowStart,
    createdAt,
    requests = [],
    isPooled,
    totalQuantityLitres,
  } = booking;

  const isPending = status === BookingStatus.OPEN || status === BookingStatus.MATCHED;
  const isAccepted = status === BookingStatus.ACCEPTED;
  const isEnRoute = status === BookingStatus.EN_ROUTE;
  const isDelivered = status === BookingStatus.DELIVERED;
  const isCancelled = status === BookingStatus.CANCELLED;

  const handleAccept = () => {
    onAccept(bookingId);
  };

  const handleConfirmReject = () => {
    onReject(bookingId, rejectReason);
    setRejecting(false);
  };

  const handleMarkEnRoute = () => {
    onUpdateStatus(bookingId, BookingStatus.EN_ROUTE);
  };

  const handleMarkDelivered = () => {
    onUpdateStatus(bookingId, BookingStatus.DELIVERED);
  };

  return (
    <div className={`booking-card card status-border-${status.toLowerCase()}`}>
      <div className="booking-card-header">
        <div className="booking-id-group">
          <span className="booking-id font-mono">#{bookingId}</span>
          {isPooled ? (
            <span className="pool-badge" title="Combined delivery serving multiple neighboring households">
              👥 Pooled Order ({requests.length} Households)
            </span>
          ) : (
            <span className="single-badge">🏠 Single Order</span>
          )}
        </div>
        <StatusBadge status={status} size="md" />
      </div>

      <div className="booking-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Total Water Volume</span>
          <span className="meta-value highlight-volume">
            {totalQuantityLitres ? totalQuantityLitres.toLocaleString() : '—'} Litres
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Quoted Total Amount</span>
          <span className="meta-value highlight-price">
            ₹{quotedPrice?.toLocaleString() || '—'}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Delivery Window</span>
          <span className="meta-value">
            {deliveryWindowStart ? new Date(deliveryWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Requested At</span>
          <span className="meta-value font-secondary">
            {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      {/* Household requests breakdown - maintains identity of individual participants */}
      <div className="households-section">
        <span className="households-title">Participating Household Details:</span>
        <div className="households-list">
          {requests.length > 0 ? (
            requests.map((req, idx) => (
              <div key={req.requestId || idx} className="household-row">
                <div className="household-info">
                  <span className="household-num">#{idx + 1}</span>
                  <div>
                    <span className="household-name">{req.locality || 'Cidco Sector'}</span>
                    <span className="household-id font-mono">({req.requestId})</span>
                  </div>
                </div>
                <div className="household-allocation">
                  <span className="qty-tag">{req.quantityLitres?.toLocaleString()} L</span>
                  <span className="price-tag">₹{req.quotedPrice}</span>
                  <StatusBadge status={req.status} size="sm" />
                </div>
              </div>
            ))
          ) : (
            <div className="household-row-fallback">
              Request IDs: {booking.requestIds?.join(', ') || 'N/A'}
            </div>
          )}
        </div>
      </div>

      {/* Operator Action Bar */}
      <div className="booking-card-actions">
        {isPending && !rejecting && (
          <div className="action-row">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAccept}
              disabled={actionLoading}
              id={`btn-accept-${bookingId}`}
            >
              ✓ Accept Booking
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setRejecting(true)}
              disabled={actionLoading}
              id={`btn-reject-open-${bookingId}`}
            >
              ✕ Decline
            </button>
          </div>
        )}

        {isPending && rejecting && (
          <div className="reject-form">
            <label className="input-label" htmlFor={`reject-reason-${bookingId}`}>
              Reason for Declining:
            </label>
            <input
              id={`reject-reason-${bookingId}`}
              type="text"
              className="form-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Tanker capacity reserved or depot delay"
            />
            <div className="reject-btn-row">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                id={`btn-confirm-reject-${bookingId}`}
              >
                Confirm Decline
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRejecting(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {isAccepted && (
          <div className="action-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleMarkEnRoute}
              disabled={actionLoading}
              id={`btn-enroute-${bookingId}`}
            >
              🚚 Start Delivery (Mark En Route)
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onUpdateStatus(bookingId, BookingStatus.CANCELLED)}
              disabled={actionLoading}
            >
              Cancel Assignment
            </button>
          </div>
        )}

        {isEnRoute && (
          <div className="action-row">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleMarkDelivered}
              disabled={actionLoading}
              id={`btn-delivered-${bookingId}`}
            >
              ✓ Confirm Delivery Complete
            </button>
            <span className="enroute-hint">
              Vehicle is in transit. GPS simulation updates the live drop-off timeline.
            </span>
          </div>
        )}

        {isDelivered && (
          <div className="completed-row">
            <span className="check-done">✓ Fulfilled &amp; Recorded</span>
            <span className="timestamp-done">
              Delivered at {booking.updatedAt ? new Date(booking.updatedAt).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        )}

        {isCancelled && (
          <div className="cancelled-row">
            <span className="cross-cancelled">✕ Cancelled / Declined</span>
            {booking.cancellationReason && (
              <span className="cancel-reason">Reason: {booking.cancellationReason}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
