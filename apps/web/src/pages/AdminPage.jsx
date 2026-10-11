import React, { useState, useEffect, useCallback } from 'react';
import { operatorApi } from '../services/operatorApi.js';
import { apiClient } from '../services/apiClient.js';
import { AdminStatsOverview } from '../components/admin/AdminStatsOverview.jsx';
import { TankerFleetTable } from '../components/admin/TankerFleetTable.jsx';
import { AdminBookingsTable } from '../components/admin/AdminBookingsTable.jsx';
import { ShortageReportsReview } from '../components/admin/ShortageReportsReview.jsx';
import { PriceTransparencyAudit } from '../components/admin/PriceTransparencyAudit.jsx';
import { NoticeBanner } from '../components/shared/NoticeBanner.jsx';

export function AdminPage() {
  const [stats, setStats] = useState({});
  const [tankers, setTankers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('FLEET');
  const [feedback, setFeedback] = useState(null);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fleetStats, tankerList, bookingList, reportList] = await Promise.all([
        operatorApi.getFleetOverview(),
        operatorApi.getTankers(),
        operatorApi.getBookings(),
        operatorApi.getShortageReports(),
      ]);

      setStats(fleetStats);
      setTankers(tankerList);
      setBookings(bookingList);
      setReports(reportList);
    } catch (err) {
      console.error('[AdminPage] Failed to load records:', err);
      setError(err.message || 'Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUpdateReportStatus = async (reportId, status) => {
    await operatorApi.updateReportStatus(reportId, status);
    setReports(prev => prev.map(r => r.reportId === reportId ? { ...r, verificationStatus: status } : r));
    const fleetStats = await operatorApi.getFleetOverview();
    setStats(fleetStats);
  };

  const handleResetData = () => {
    apiClient.resetDemo();
    loadAdminData();
    setFeedback({ type: 'success', text: 'Demonstration records reset to baseline state.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="admin-page">
      <NoticeBanner
        type="warning"
        message="Notice: Demonstration Admin Console — Authenticated production security is disabled for this test suite. Telemetry freshness flags identify tanker GPS updates older than 4 hours."
      />

      {feedback && (
        <div className={`status-feedback feedback-${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {error && (
        <div className="status-feedback feedback-error">
          ⚠️ {error} &mdash;{' '}
          <button type="button" className="btn-link" onClick={loadAdminData}>
            Retry loading
          </button>
        </div>
      )}

      {/* Overview Statistics KPIs */}
      <AdminStatsOverview stats={stats} />

      {/* Navigation tabs for Admin Sub-Sections */}
      <div className="admin-subnav-row">
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'FLEET' ? 'active' : ''}`}
            onClick={() => setActiveTab('FLEET')}
          >
            🚚 Tanker Fleet ({tankers.length})
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'BOOKINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('BOOKINGS')}
          >
            📋 Bookings &amp; Pools ({bookings.length})
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`}
            onClick={() => setActiveTab('REPORTS')}
          >
            📢 Shortage Reports ({reports.length})
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'PRICING' ? 'active' : ''}`}
            onClick={() => setActiveTab('PRICING')}
          >
            ⚖️ Pricing Audit
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleResetData}
          title="Reset local mock database to original demo seeds"
        >
          🔄 Re-seed Demo Data
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'FLEET' && (
        <TankerFleetTable tankers={tankers} />
      )}

      {activeTab === 'BOOKINGS' && (
        <AdminBookingsTable bookings={bookings} />
      )}

      {activeTab === 'REPORTS' && (
        <ShortageReportsReview
          reports={reports}
          onUpdateStatus={handleUpdateReportStatus}
        />
      )}

      {activeTab === 'PRICING' && (
        <PriceTransparencyAudit tankers={tankers} />
      )}
import React from 'react';

export function AdminPage() {
  return (
    <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '36px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
          Portal Administration & Oversight
        </h2>
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <span className="badge badge-simulated">Person 3 Ownership Module</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          This interface is assigned to <strong>Person 3</strong> (`feat/operator-admin`).
          It will feature supplier verification management, community shortage reports review, and transparent pricing discrepancy oversight.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
          Please select <strong>Resident Experience</strong> in the top navigation to test Person 1's implemented interactive map and water booking workflows.
        </p>
      </div>
    </div>
  );
}
