import React, { useState } from 'react';
import { Navbar } from './components/shared/Navbar.jsx';
import { OperatorPage } from './pages/OperatorPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { ResidentPage } from './pages/ResidentPage.jsx';
import { apiClient } from './services/apiClient.js';
import './styles/global.css';
import './styles/operator.css';
import './styles/admin.css';
import './styles/resident.css';

export function App() {
  // Default to Operator Dispatch view (Person 3 primary ownership)
  const [activeView, setActiveView] = useState('operator');
  const [resetKey, setResetKey] = useState(0);

  const handleResetDemo = () => {
    apiClient.resetDemo();
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="app-container" key={resetKey}>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onResetDemo={handleResetDemo}
      />

      <main className="main-content">
        {activeView === 'operator' && <OperatorPage />}
        {activeView === 'admin' && <AdminPage />}
        {activeView === 'resident' && <ResidentPage />}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <strong>WaterSaathi (जलसाथी)</strong> &bull; Indian Water-Tanker Discovery, Booking &amp; Demand Pooling Platform
          </div>
          <div>
            Demonstration build for Chhatrapati Sambhajinagar (Aurangabad), Maharashtra.
          </div>
        </div>
import { ResidentPage } from './pages/ResidentPage.jsx';
import { OperatorPage } from './pages/OperatorPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { residentApi } from './services/residentApi.js';

export function App() {
  const [activeRole, setActiveRole] = useState('RESIDENT');
  const [resetMessage, setResetMessage] = useState('');

  const handleResetDemo = () => {
    residentApi.resetDemoData();
    setResetMessage('Demo state reset!');
    setTimeout(() => {
      setResetMessage('');
      window.location.reload();
    }, 600);
  };

  return (
    <div className="watersaathi-app">
      {/* App Top Navigation */}
      <header className="app-header">
        <div className="container header-container">
          <div className="brand-wrapper">
            <div className="brand-icon" aria-hidden="true">
              💧
            </div>
            <div>
              <h1 className="brand-title">
                WaterSaathi <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>जल साथी</span>
              </h1>
              <p className="brand-sub">Community Water Tanker Discovery & Demand Pooling</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <nav className="role-nav" aria-label="Role Navigation">
              <button
                type="button"
                className={`role-tab ${activeRole === 'RESIDENT' ? 'active' : ''}`}
                onClick={() => setActiveRole('RESIDENT')}
              >
                🏠 Resident
              </button>
              <button
                type="button"
                className={`role-tab ${activeRole === 'OPERATOR' ? 'active' : ''}`}
                onClick={() => setActiveRole('OPERATOR')}
              >
                🚚 Operator
              </button>
              <button
                type="button"
                className={`role-tab ${activeRole === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setActiveRole('ADMIN')}
              >
                🛡️ Admin
              </button>
            </nav>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 10px', minHeight: '34px' }}
              onClick={handleResetDemo}
              title="Reset in-memory & localStorage demo state"
            >
              🔄 {resetMessage || 'Reset Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* Role View Routing */}
      {activeRole === 'RESIDENT' && <ResidentPage />}
      {activeRole === 'OPERATOR' && <OperatorPage />}
      {activeRole === 'ADMIN' && <AdminPage />}

      {/* Global Footer */}
      <footer
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          padding: '24px 16px',
          marginTop: '40px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            WaterSaathi (जल साथी) — Open Architecture Community Water Access
          </p>
          <p>
            Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors. 
            All supplier positions, rates, and demand pooling matches are simulated demonstration data.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
