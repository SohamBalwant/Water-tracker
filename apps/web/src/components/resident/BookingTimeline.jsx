import React, { useState, useEffect } from 'react';

const STATUS_STEPS = [
  { key: 'OPEN', label: 'Requested' },
  { key: 'MATCHED', label: 'Matched' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'EN_ROUTE', label: 'En Route' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function BookingTimeline({
  bookings = [],
  activeRequest,
  onRefresh,
  tankers = [],
}) {
  const [autoPoll, setAutoPoll] = useState(true);

  // Auto-poll every 6 seconds if active booking is not delivered
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPoll, onRefresh]);

  if (bookings.length === 0 && !activeRequest) {
    return (
      <div className="empty-state-box" style={{ marginTop: '20px' }}>
        <div className="empty-icon">📋</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
          No Active Water Bookings
        </h3>
        <p style={{ fontSize: '0.85rem' }}>
          Select a nearby tanker or submit a request above to track live dispatch status.
        </p>
      </div>
    );
  }

  // Find the primary active booking or request
  const currentBooking = bookings[0] || null;
  const currentStatus = currentBooking?.status || activeRequest?.status || 'OPEN';

  // Determine tanker details
  const linkedTankerId = currentBooking?.tankerId || activeRequest?.tankerId;
  const linkedTanker = tankers.find((t) => t.tankerId === linkedTankerId) || null;

  // Step indices
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  const resolvedIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  let freshnessText = 'Recently';
  if (linkedTanker?.lastLocationUpdate) {
    const diffMins = Math.round(
      (Date.now() - new Date(linkedTanker.lastLocationUpdate).getTime()) / (1000 * 60)
    );
    if (diffMins <= 1) freshnessText = 'Just now';
    else if (diffMins < 60) freshnessText = `${diffMins} mins ago`;
    else freshnessText = `${Math.round(diffMins / 60)} hrs ago`;
  }

  return (
    <div className="tracker-section" aria-label="Active Booking Tracker">
      <div className="tracker-card">
        <div className="tracker-header">
          <div>
            <span className="tracker-id">
              {currentBooking ? `Booking ID: ${currentBooking.bookingId}` : `Request ID: ${activeRequest?.requestId}`}
            </span>
            <h3 className="tracker-title">
              Live Delivery Status:{' '}
              <span className={`badge badge-${currentStatus.toLowerCase()}`}>
                {currentStatus}
              </span>
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
              onClick={onRefresh}
              title="Fetch latest dispatch and GPS updates"
            >
              🔄 Refresh
            </button>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={autoPoll}
                onChange={(e) => setAutoPoll(e.target.checked)}
              />
              Live Sync
            </label>
          </div>
        </div>

        {/* 5-Step Timeline */}
        <div className="step-timeline" aria-label="Progress timeline">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < resolvedIndex;
            const isCurrent = idx === resolvedIndex;
            return (
              <div
                key={step.key}
                className={`timeline-step ${isCompleted ? 'completed' : ''} ${
                  isCurrent ? 'current' : ''
                }`}
              >
                <div className="step-circle">{isCompleted ? '✓' : idx + 1}</div>
                <div className="step-name">{step.label}</div>
              </div>
            );
          })}
        </div>

        {/* Linked Details Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
              Your Requested Water
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {activeRequest?.quantityLitres?.toLocaleString() || '2,000'} Litres
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeRequest?.waterType === 'DRINKING' ? 'Drinking Water' : 'Non-Drinking / Utility'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
              Confirmed Price Quote
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1' }}>
              ₹{(currentBooking?.quotedPrice || activeRequest?.quotedPrice || 1000).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentBooking?.requestIds?.length > 1 ? '🤝 Pooled Delivery Rate' : 'Direct Single Rate'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
              Assigned Supplier
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {linkedTanker?.displayName || 'Awaiting assignment'}
            </div>
            {linkedTanker?.contactNumber && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                📞 {linkedTanker.contactNumber}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
              Tanker Location Freshness
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Updated {freshnessText}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Coordinates: {linkedTanker?.latitude ? `${linkedTanker.latitude.toFixed(4)}, ${linkedTanker.longitude.toFixed(4)}` : 'En route'} ({linkedTanker?.locationSource || 'SIMULATED'})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
