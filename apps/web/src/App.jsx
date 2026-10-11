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
      </footer>
    </div>
  );
}

export default App;
