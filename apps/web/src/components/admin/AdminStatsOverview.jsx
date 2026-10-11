import React from 'react';

export function AdminStatsOverview({ stats = {} }) {
  return (
    <div className="admin-stats-overview">
      <div className="admin-warning-banner">
        <span className="warning-icon">🛡️</span>
        <div>
          <strong>Municipal &amp; Fleet Administration Console (Demo Mode)</strong>
          <p>
            This portal is for system simulation and demonstration. It is not currently protected by production OAuth/Cognito credentials. Do not use for actual municipal dispatch without authentication.
          </p>
        </div>
      </div>

      <div className="stats-kpi-grid">
        <div className="kpi-card card">
          <div className="kpi-header">
            <span className="kpi-title">Fleet Capacity</span>
            <span className="kpi-icon">💧</span>
          </div>
          <div className="kpi-value">
            {stats.availableLitres?.toLocaleString() || 0}
            <span className="kpi-unit"> / {stats.totalCapacityLitres?.toLocaleString() || 0} L</span>
          </div>
          <div className="kpi-sub">
            {stats.availableCount || 0} available &bull; {stats.busyCount || 0} busy &bull; {stats.enRouteCount || 0} in transit
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-header">
            <span className="kpi-title">Active Orders</span>
            <span className="kpi-icon">🚚</span>
          </div>
          <div className="kpi-value">{stats.activeBookingsCount || 0}</div>
          <div className="kpi-sub">
            {stats.deliveredBookingsCount || 0} total fulfilled orders today
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-header">
            <span className="kpi-title">Stale Location Alerts</span>
            <span className="kpi-icon">⚠️</span>
          </div>
          <div className="kpi-value text-danger">
            {stats.staleTankersCount || 0}
          </div>
          <div className="kpi-sub">
            {stats.staleTankersCount > 0 ? 'Tankers with GPS > 4 hours old' : 'All vehicle locations fresh'}
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-header">
            <span className="kpi-title">Shortage Reports</span>
            <span className="kpi-icon">📢</span>
          </div>
          <div className="kpi-value text-warning">
            {stats.totalReportsCount || 0}
          </div>
          <div className="kpi-sub">
            {stats.unverifiedReportsCount || 0} unverified community reports
          </div>
        </div>
      </div>
    </div>
  );
}
