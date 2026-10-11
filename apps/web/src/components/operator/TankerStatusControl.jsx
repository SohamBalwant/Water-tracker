import React, { useState } from 'react';
import { TankerStatus } from '../../shared/types.js';

export function TankerStatusControl({
  tanker,
  onStatusChange,
  isUpdating = false,
}) {
  const [feedback, setFeedback] = useState(null);

  if (!tanker) return null;

  const statuses = [
    {
      key: TankerStatus.AVAILABLE,
      label: 'Available',
      icon: '🟢',
      desc: 'Ready to receive and fulfill residential bookings.',
    },
    {
      key: TankerStatus.BUSY,
      label: 'Busy / Loading',
      icon: '🟡',
      desc: 'At municipal water depot or filling borehole.',
    },
    {
      key: TankerStatus.EN_ROUTE,
      label: 'En Route',
      icon: '🔵',
      desc: 'Actively in transit for a delivery order.',
    },
    {
      key: TankerStatus.OFFLINE,
      label: 'Offline',
      icon: '⚪',
      desc: 'Off-duty, under maintenance, or empty.',
    },
  ];

  const handleSelect = async (newStatus) => {
    if (newStatus === tanker.status || isUpdating) return;
    try {
      setFeedback({ type: 'info', msg: `Updating status to ${newStatus}...` });
      await onStatusChange(tanker.tankerId, newStatus);
      setFeedback({ type: 'success', msg: `Status successfully updated to ${newStatus}.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to update status.' });
    }
  };

  return (
    <div className="tanker-status-control card">
      <div className="section-title-row">
        <div>
          <h3 className="section-title">Operational Status Control</h3>
          <p className="section-subtitle">
            Update how this tanker appears in resident search results and automated pooling matching.
          </p>
        </div>
        {feedback && (
          <div className={`status-feedback feedback-${feedback.type}`}>
            {feedback.msg}
          </div>
        )}
      </div>

      <div className="status-button-grid">
        {statuses.map(s => {
          const isCurrent = tanker.status === s.key;
          return (
            <button
              key={s.key}
              type="button"
              className={`status-toggle-card ${isCurrent ? 'active' : ''}`}
              onClick={() => handleSelect(s.key)}
              disabled={isUpdating}
              id={`btn-status-${s.key.toLowerCase()}`}
            >
              <div className="toggle-header">
                <span className="toggle-icon">{s.icon}</span>
                <span className="toggle-label">{s.label}</span>
                {isCurrent && <span className="active-pill">CURRENT</span>}
              </div>
              <p className="toggle-desc">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
