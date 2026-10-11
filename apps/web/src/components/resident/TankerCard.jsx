import React from 'react';

export function TankerCard({
  tanker,
  isSelected,
  onSelect,
  onRequest,
}) {
  const {
    displayName,
    capacityLitres = 5000,
    availableLitres = 5000,
    pricePer1000Litres = 500,
    waterType = 'NON_DRINKING',
    status = 'AVAILABLE',
    verificationStatus = 'UNVERIFIED',
    locationSource = 'SIMULATED',
    lastLocationUpdate,
    distanceKm,
    locality,
  } = tanker;

  const capacityPercent = Math.min(
    100,
    Math.max(0, Math.round((availableLitres / capacityLitres) * 100))
  );

  let fillClass = 'high';
  if (capacityPercent < 30) fillClass = 'low';
  else if (capacityPercent < 70) fillClass = 'medium';

  // Format relative time
  let freshnessText = 'Recently';
  if (lastLocationUpdate) {
    const diffMins = Math.round((Date.now() - new Date(lastLocationUpdate).getTime()) / (1000 * 60));
    if (diffMins <= 1) freshnessText = 'Just now';
    else if (diffMins < 60) freshnessText = `${diffMins} mins ago`;
    else freshnessText = `${Math.round(diffMins / 60)} hrs ago`;
  }

  return (
    <article
      className={`tanker-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Tanker ${displayName}, status ${status}, rate ₹${pricePer1000Litres} per thousand litres`}
    >
      <div className="tanker-card-header">
        <div className="tanker-title-area">
          <h3 className="tanker-name">{displayName}</h3>
          <div className="tanker-meta-row">
            {distanceKm !== undefined && (
              <span className="tanker-distance">📍 {distanceKm} km away</span>
            )}
            {locality && <span className="tanker-locality">• {locality}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
          <span
            className={`badge ${
              verificationStatus === 'VERIFIED' ? 'badge-verified' : 'badge-unverified'
            }`}
            title={
              verificationStatus === 'VERIFIED'
                ? 'Identity & registration verified by local portal operator'
                : 'Unverified supplier'
            }
          >
            {verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="tanker-metrics-row">
        <div className="metric-item">
          <div className="metric-label">Rate / 1000L</div>
          <div className="metric-value price">₹{pricePer1000Litres}</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Available</div>
          <div className="metric-value">{availableLitres.toLocaleString()} L</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Water Type</div>
          <div className="metric-value" style={{ fontSize: '0.8rem' }}>
            {waterType === 'DRINKING' ? 'Drinking (Potable)' : 'Utility / Non-Drinking'}
          </div>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="capacity-bar-wrapper">
        <div className="capacity-labels">
          <span>Capacity Filled</span>
          <span>
            {availableLitres.toLocaleString()} / {capacityLitres.toLocaleString()} L ({capacityPercent}%)
          </span>
        </div>
        <div className="capacity-bar-track" aria-hidden="true">
          <div
            className={`capacity-bar-fill ${fillClass}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Card Footer with Freshness and Primary Action */}
      <div className="card-footer">
        <div className="freshness-tag">
          <span>📡 Updated {freshnessText}</span>
          <span style={{ opacity: 0.6 }}>({locationSource})</span>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-primary btn-request"
            onClick={(e) => {
              e.stopPropagation();
              onRequest(tanker);
            }}
            disabled={status !== 'AVAILABLE' || availableLitres < 500}
            title={
              status !== 'AVAILABLE'
                ? 'Tanker is currently busy or en route'
                : availableLitres < 500
                ? 'Insufficient capacity'
                : 'Create water request for this tanker'
            }
          >
            Request Water
          </button>
        </div>
      </div>
    </article>
  );
}
