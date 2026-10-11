import React from 'react';
import { StatusBadge } from '../shared/StatusBadge.jsx';
import { FreshnessIndicator } from '../shared/FreshnessIndicator.jsx';
import { VerificationBadge } from '../shared/VerificationBadge.jsx';

export function OperatorHeader({
  tankers = [],
  selectedTankerId,
  onSelectTanker,
  selectedTanker,
}) {
  return (
    <div className="operator-header-panel card">
      <div className="operator-header-top">
        <div className="operator-profile">
          <div className="profile-badge">
            <span className="profile-icon">🚚</span>
          </div>
          <div>
            <div className="operator-title">
              <h2>Tanker Dispatch &amp; Operations</h2>
              <span className="operator-id-tag">Operator ID: {selectedTanker?.operatorId || 'operator-001'}</span>
            </div>
            <p className="operator-desc">
              Manage live tanker assignments, update operational availability, and control simulated route telematics.
            </p>
          </div>
        </div>

        <div className="tanker-selector-group">
          <label htmlFor="tanker-select" className="input-label">Select Active Tanker</label>
          <select
            id="tanker-select"
            className="form-select"
            value={selectedTankerId || ''}
            onChange={(e) => onSelectTanker(e.target.value)}
          >
            {tankers.map(t => (
              <option key={t.tankerId} value={t.tankerId}>
                {t.displayName} ({t.capacityLitres}L - {t.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTanker && (
        <div className="selected-tanker-summary">
          <div className="summary-stat-box">
            <span className="stat-label">Tanker Details</span>
            <div className="stat-value">{selectedTanker.displayName}</div>
            <div className="stat-sub">
              <VerificationBadge status={selectedTanker.verificationStatus} />
            </div>
          </div>

          <div className="summary-stat-box">
            <span className="stat-label">Capacity / Available</span>
            <div className="stat-value">
              {selectedTanker.availableLitres?.toLocaleString()} <span className="stat-unit">/ {selectedTanker.capacityLitres?.toLocaleString()} L</span>
            </div>
            <div className="stat-sub">
              Water: <strong>{selectedTanker.waterType === 'DRINKING' ? 'Drinking Utility' : 'Non-Drinking'}</strong>
            </div>
          </div>

          <div className="summary-stat-box">
            <span className="stat-label">Current Status</span>
            <div className="stat-value">
              <StatusBadge status={selectedTanker.status} size="md" />
            </div>
            <div className="stat-sub">
              Rate: ₹{selectedTanker.pricePer1000Litres} / 1000L
            </div>
          </div>

          <div className="summary-stat-box">
            <span className="stat-label">Telemetry Freshness</span>
            <div className="stat-value">
              <FreshnessIndicator
                timestamp={selectedTanker.lastLocationUpdate}
                source={selectedTanker.locationSource}
              />
            </div>
            <div className="stat-sub">
              {selectedTanker.latitude.toFixed(4)}° N, {selectedTanker.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
