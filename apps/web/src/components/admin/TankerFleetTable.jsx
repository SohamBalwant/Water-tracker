import React, { useState } from 'react';
import { StatusBadge } from '../shared/StatusBadge.jsx';
import { FreshnessIndicator } from '../shared/FreshnessIndicator.jsx';
import { WaterTypeBadge } from '../shared/WaterTypeBadge.jsx';
import { VerificationBadge } from '../shared/VerificationBadge.jsx';

export function TankerFleetTable({ tankers = [], onUpdateTanker }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const now = Date.now();
  const isStale = (iso) => (now - new Date(iso || 0).getTime()) > 4 * 60 * 60 * 1000;

  const filtered = tankers.filter(t => {
    if (filter === 'STALE' && !isStale(t.lastLocationUpdate)) return false;
    if (filter === 'UNVERIFIED' && t.verificationStatus !== 'UNVERIFIED') return false;
    if (filter === 'AVAILABLE' && t.status !== 'AVAILABLE') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.displayName.toLowerCase().includes(q) ||
        t.tankerId.toLowerCase().includes(q) ||
        t.operatorId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="tanker-fleet-table card">
      <div className="table-header-row">
        <div>
          <h3 className="section-title">Registered Tanker Fleet ({tankers.length})</h3>
          <p className="section-subtitle">
            Audit tanker capacities, verification states, pricing compliance, and telemetry freshness.
          </p>
        </div>

        <div className="table-filter-bar">
          <input
            type="text"
            className="form-input form-input-sm"
            placeholder="Search tanker or operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Tankers ({tankers.length})</option>
            <option value="STALE">Stale Locations Only</option>
            <option value="UNVERIFIED">Unverified Only</option>
            <option value="AVAILABLE">Available Only</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tanker / Identifier</th>
              <th>Operator</th>
              <th>Capacity</th>
              <th>Water Type</th>
              <th>Rate / 1000L</th>
              <th>Operational Status</th>
              <th>Verification</th>
              <th>Location Freshness</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">
                  No tankers match the specified search or filter.
                </td>
              </tr>
            ) : (
              filtered.map(t => {
                const stale = isStale(t.lastLocationUpdate);
                return (
                  <tr key={t.tankerId} className={stale ? 'row-stale-warning' : ''}>
                    <td>
                      <div className="font-semibold">{t.displayName}</div>
                      <div className="font-mono text-xs text-muted">{t.tankerId}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{t.operatorId}</span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <strong>{t.availableLitres?.toLocaleString()}</strong> / {t.capacityLitres?.toLocaleString()} L
                      </div>
                      <div className="table-progress-bar">
                        <div
                          className="table-progress-fill"
                          style={{
                            width: `${Math.round((t.availableLitres / t.capacityLitres) * 100)}%`,
                            backgroundColor: t.availableLitres < 1000 ? '#ef4444' : '#10b981',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <WaterTypeBadge waterType={t.waterType} />
                    </td>
                    <td>
                      <span className={`font-semibold ${t.pricePer1000Litres > 1500 ? 'text-warning' : ''}`}>
                        ₹{t.pricePer1000Litres}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td>
                      <VerificationBadge status={t.verificationStatus} />
                    </td>
                    <td>
                      <FreshnessIndicator
                        timestamp={t.lastLocationUpdate}
                        source={t.locationSource}
                      />
                      {stale && (
                        <div className="stale-alert-pill">⚠️ STALE TELEMETRY</div>
                      )}
                    </td>
                    <td className="font-mono text-xs">
                      {t.latitude?.toFixed(4)}°, {t.longitude?.toFixed(4)}°
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
