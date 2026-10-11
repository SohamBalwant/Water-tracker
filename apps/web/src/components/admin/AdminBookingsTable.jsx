import React, { useState } from 'react';
import { StatusBadge } from '../shared/StatusBadge.jsx';

export function AdminBookingsTable({ bookings = [] }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = bookings.filter(b => {
    if (filter === 'POOLED' && !b.isPooled) return false;
    if (filter === 'ACTIVE' && b.status !== 'ACCEPTED' && b.status !== 'EN_ROUTE') return false;
    if (filter === 'DELIVERED' && b.status !== 'DELIVERED') return false;
    return true;
  });

  return (
    <div className="admin-bookings-table card">
      <div className="table-header-row">
        <div>
          <h3 className="section-title">All Platform Bookings ({bookings.length})</h3>
          <p className="section-subtitle">
            Complete record of single and pooled residential water orders and delivery fulfillments.
          </p>
        </div>

        <div className="table-filter-bar">
          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Bookings ({bookings.length})</option>
            <option value="POOLED">Pooled Orders Only</option>
            <option value="ACTIVE">Active in Transit</option>
            <option value="DELIVERED">Delivered / Complete</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Assigned Tanker</th>
              <th>Type</th>
              <th>Participating Households &amp; Volumes</th>
              <th>Total Volume</th>
              <th>Quoted Price</th>
              <th>Status</th>
              <th>Timeline</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No bookings found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.bookingId}>
                  <td className="font-mono text-xs font-semibold">
                    #{b.bookingId}
                  </td>
                  <td>
                    <span className="font-semibold text-sm">
                      {b.tanker?.displayName || b.tankerId}
                    </span>
                  </td>
                  <td>
                    {b.isPooled ? (
                      <span className="pool-badge text-xs">👥 Pooled</span>
                    ) : (
                      <span className="single-badge text-xs">🏠 Single</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-household-breakdown">
                      {b.requests?.length > 0 ? (
                        b.requests.map((r, i) => (
                          <div key={r.requestId || i} className="admin-household-chip">
                            <span className="chip-locality">{r.locality || 'Cidco'}</span>
                            <span className="chip-qty">{r.quantityLitres?.toLocaleString()}L</span>
                            <span className="chip-price">₹{r.quotedPrice}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted">
                          Requests: {b.requestIds?.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{b.totalQuantityLitres?.toLocaleString() || '—'} L</strong>
                  </td>
                  <td>
                    <span className="font-semibold text-primary">₹{b.quotedPrice?.toLocaleString()}</span>
                  </td>
                  <td>
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="text-xs text-muted">
                    <div>Created: {b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    {b.updatedAt && <div>Updated: {new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
