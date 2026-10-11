import React from 'react';
import { apiClient } from '../../services/apiClient.js';

export function Navbar({ activeView, setActiveView, onResetDemo }) {
  const isMock = apiClient.isMockMode();

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group" onClick={() => setActiveView('operator')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <span className="drop-icon">💧</span>
          </div>
          <div>
            <div className="brand-name">
              WaterSaathi <span className="brand-hindi">जलसाथी</span>
            </div>
            <div className="brand-subtitle">Community Water-Tanker Coordination</div>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Portal Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'resident' ? 'active' : ''}`}
            onClick={() => setActiveView('resident')}
            id="nav-resident-btn"
          >
            <span>🏠</span>
            <span>Resident</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'operator' ? 'active' : ''}`}
            onClick={() => setActiveView('operator')}
            id="nav-operator-btn"
          >
            <span>🚚</span>
            <span>Operator Dispatch</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveView('admin')}
            id="nav-admin-btn"
          >
            <span>🛡️</span>
            <span>Admin Console</span>
          </button>
        </nav>

        <div className="header-actions">
          <div className="mode-pill" title={isMock ? 'Running on self-contained browser mock API' : 'Connected to HTTP API backend'}>
            <span className="dot" style={{ backgroundColor: isMock ? '#10b981' : '#3b82f6' }} />
            <span>{isMock ? 'Mock Demo Store' : 'Backend Connected'}</span>
          </div>

          <button
            type="button"
            className="btn-reset-demo"
            onClick={onResetDemo}
            title="Reset demonstration records to original state"
            id="btn-reset-demo-header"
          >
            🔄 Reset Demo
          </button>
        </div>
      </div>
    </header>
  );
}
