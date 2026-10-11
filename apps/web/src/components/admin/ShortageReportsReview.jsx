import React, { useState } from 'react';
import { StatusBadge } from '../shared/StatusBadge.jsx';
import { ShortageReportStatus } from '../../shared/types.js';

export function ShortageReportsReview({
  reports = [],
  onUpdateStatus,
}) {
  const [filter, setFilter] = useState('ALL');
  const [actioningId, setActioningId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const filtered = reports.filter(r => {
    if (filter === 'UNVERIFIED' && r.verificationStatus !== ShortageReportStatus.UNVERIFIED) return false;
    if (filter === 'UNDER_REVIEW' && r.verificationStatus !== ShortageReportStatus.UNDER_REVIEW) return false;
    if (filter === 'VERIFIED' && r.verificationStatus !== ShortageReportStatus.VERIFIED) return false;
    return true;
  });

  const handleAction = async (reportId, newStatus) => {
    try {
      setActioningId(reportId);
      await onUpdateStatus(reportId, newStatus);
      setActionMessage({ type: 'success', text: `Report ${reportId} marked as ${newStatus}.` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update report status.' });
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="shortage-reports-review card">
      <div className="table-header-row">
        <div>
          <h3 className="section-title">Community Water Shortage Reports ({reports.length})</h3>
          <p className="section-subtitle">
            Crowdsourced citizen reports of dry borewells, disrupted municipal lines, and emergency locality deficits.
          </p>
        </div>

        <div className="table-filter-bar">
          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Reports ({reports.length})</option>
            <option value="UNVERIFIED">Unverified Only</option>
            <option value="UNDER_REVIEW">Under Review Only</option>
            <option value="VERIFIED">Verified Shortages Only</option>
          </select>
        </div>
      </div>

      <div className="community-report-disclaimer">
        ℹ️ <strong>Honesty Notice:</strong> Resident reports represent citizen-submitted community observations. They do not constitute official municipal water board declarations until independently audited.
      </div>

      {actionMessage && (
        <div className={`status-feedback feedback-${actionMessage.type} mb-3`}>
          {actionMessage.text}
        </div>
      )}

      <div className="reports-grid">
        {filtered.length === 0 ? (
          <div className="text-center py-4 text-muted w-100">
            No community shortage reports match the filter.
          </div>
        ) : (
          filtered.map(report => {
            const isUnverified = report.verificationStatus === ShortageReportStatus.UNVERIFIED;
            const isReview = report.verificationStatus === ShortageReportStatus.UNDER_REVIEW;
            const isVerified = report.verificationStatus === ShortageReportStatus.VERIFIED;
            const isRejected = report.verificationStatus === ShortageReportStatus.REJECTED;

            return (
              <div key={report.reportId} className={`report-card card status-border-${report.verificationStatus.toLowerCase()}`}>
                <div className="report-card-header">
                  <div>
                    <h4 className="report-locality">{report.locality}</h4>
                    <span className="report-id font-mono text-xs text-muted">
                      #{report.reportId} &bull; Reporter: {report.reporterId}
                    </span>
                  </div>
                  <StatusBadge status={report.verificationStatus} size="sm" />
                </div>

                <p className="report-description">
                  "{report.description}"
                </p>

                <div className="report-meta-row">
                  <span className="report-coords font-mono text-xs">
                    📍 {report.latitude?.toFixed(4)}° N, {report.longitude?.toFixed(4)}° E
                  </span>
                  <span className="report-time text-xs text-muted">
                    {new Date(report.reportedAt).toLocaleDateString()} at {new Date(report.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="report-action-buttons">
                  {isUnverified && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.UNDER_REVIEW)}
                        disabled={actioningId === report.reportId}
                      >
                        🔍 Mark Under Review
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.VERIFIED)}
                        disabled={actioningId === report.reportId}
                      >
                        ✓ Verify Deficit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.REJECTED)}
                        disabled={actioningId === report.reportId}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {isReview && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.VERIFIED)}
                        disabled={actioningId === report.reportId}
                      >
                        ✓ Confirm Verification
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.REJECTED)}
                        disabled={actioningId === report.reportId}
                      >
                        ✕ Reject Report
                      </button>
                    </>
                  )}

                  {(isVerified || isRejected) && (
                    <div className="report-resolved-state">
                      {isVerified ? (
                        <span className="text-success text-xs font-semibold">
                          ✓ Verified Community Deficit Point
                        </span>
                      ) : (
                        <span className="text-danger text-xs font-semibold">
                          ✕ Rejected as Inaccurate / Resolved
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-xs"
                        onClick={() => handleAction(report.reportId, ShortageReportStatus.UNDER_REVIEW)}
                        disabled={actioningId === report.reportId}
                      >
                        Re-open Audit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
