import React, { useState, useEffect, useCallback } from 'react';
import { residentApi } from '../services/residentApi.js';
import { LocationBar, DEMO_LOCALITIES } from '../components/resident/LocationBar.jsx';
import { TankerMap } from '../components/resident/TankerMap.jsx';
import { TankerList } from '../components/resident/TankerList.jsx';
import { WaterRequestModal } from '../components/resident/WaterRequestModal.jsx';
import { PoolingModal } from '../components/resident/PoolingModal.jsx';
import { BookingTimeline } from '../components/resident/BookingTimeline.jsx';

export function ResidentPage() {
  // Location state (defaults to Cidco Sector N-5 in Aurangabad)
  const [currentLocation, setCurrentLocation] = useState({
    lat: DEMO_LOCALITIES[0].lat,
    lng: DEMO_LOCALITIES[0].lng,
  });
  const [localityName, setLocalityName] = useState(DEMO_LOCALITIES[0].name);

  // Data states
  const [tankers, setTankers] = useState([]);
  const [selectedTanker, setSelectedTanker] = useState(null);
  const [isLoadingTankers, setIsLoadingTankers] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Active orders and bookings
  const [activeRequest, setActiveRequest] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [modalTargetTanker, setModalTargetTanker] = useState(null);
  const [isPoolingModalOpen, setIsPoolingModalOpen] = useState(false);
  const [poolingOffer, setPoolingOffer] = useState(null);

  // Active view tab: 'DISCOVERY' or 'TRACKER'
  const [activeTab, setActiveTab] = useState('DISCOVERY');

  // Load tankers for current location
  const loadTankers = useCallback(async () => {
    setIsLoadingTankers(true);
    setErrorNotice(null);
    try {
      const list = await residentApi.getNearbyTankers(
        currentLocation.lat,
        currentLocation.lng
      );
      setTankers(list);
    } catch (err) {
      console.error('Failed to load tankers:', err);
      setErrorNotice('Could not load nearby tankers. Please verify network connection or server status.');
    } finally {
      setIsLoadingTankers(false);
    }
  }, [currentLocation]);

  // Load existing bookings
  const loadBookings = useCallback(async () => {
    try {
      const allBookings = await residentApi.getResidentBookings();
      setBookings(allBookings);
    } catch (err) {
      console.warn('Could not fetch bookings:', err);
    }
  }, []);

  useEffect(() => {
    loadTankers();
    loadBookings();
  }, [loadTankers, loadBookings]);

  // Handle location update from LocationBar
  const handleLocationChange = ({ lat, lng, name }) => {
    setCurrentLocation({ lat, lng });
    setLocalityName(name);
    setSelectedTanker(null);
  };

  // Open water request form
  const handleOpenRequest = (tanker = null) => {
    setModalTargetTanker(tanker || selectedTanker || tankers[0] || null);
    setIsRequestModalOpen(true);
  };

  // Submit water request & immediately check pooling eligibility
  const handleSubmitRequest = async (requestPayload) => {
    const created = await residentApi.submitWaterRequest({
      ...requestPayload,
      locality: localityName,
    });
    setActiveRequest(created);

    // Refresh tankers list to reflect state changes
    loadTankers();

    // Evaluate community demand pooling
    try {
      const poolResult = await residentApi.joinOrCheckPool(created.requestId);
      if (poolResult && poolResult.eligible) {
        setPoolingOffer({
          ...poolResult,
          individualLitres: created.quantityLitres,
          standardPrice: created.quotedPrice,
        });
        setIsPoolingModalOpen(true);
      } else {
        // No pool found; proceed to tracking
        setActiveTab('TRACKER');
        await loadBookings();
      }
    } catch (poolErr) {
      console.warn('Pooling check notice:', poolErr);
      setActiveTab('TRACKER');
      await loadBookings();
    }
  };

  // Accept community pool offer
  const handleAcceptPool = async () => {
    setIsPoolingModalOpen(false);
    setActiveTab('TRACKER');
    await loadBookings();
    await loadTankers();
  };

  // Decline pool offer and keep solo request
  const handleDeclinePool = () => {
    setIsPoolingModalOpen(false);
    setActiveTab('TRACKER');
    loadBookings();
  };

  // Stats calculation
  const availableCount = tankers.filter((t) => t.status === 'AVAILABLE').length;
  const verifiedCount = tankers.filter((t) => t.verificationStatus === 'VERIFIED').length;
  const minRate = tankers.length > 0 ? Math.min(...tankers.map((t) => t.pricePer1000Litres)) : 500;

  return (
    <main className="resident-page-wrapper">
      {/* Demonstration Banner */}
      <div className="demo-banner">
        <div className="container demo-banner-content">
          <span className="demo-banner-badge">DEMO ENVIRONMENT</span>
          <span>
            Operating in <strong>Chhatrapati Sambhajinagar (Aurangabad)</strong>. Real-time tanker coordinates and availability are simulated for demonstration.
          </span>
        </div>
      </div>

      {/* Location Selector Bar */}
      <LocationBar
        currentLocation={currentLocation}
        localityName={localityName}
        onLocationChange={handleLocationChange}
      />

      <div className="container resident-layout">
        {/* Shortage Community Alert Notice */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>📢</span>
            <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
              <strong>Locality Alert ({localityName}):</strong> Municipal supply pressure restricted. 
              {availableCount} tankers currently operating in your sector.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px', borderColor: '#3b82f6', color: '#1d4ed8' }}
            onClick={() => handleOpenRequest(null)}
          >
            + Quick Request
          </button>
        </div>

        {/* High-Level Stats Bar */}
        <div className="resident-hero-stats">
          <div className="stat-card">
            <div className="stat-icon green">💧</div>
            <div className="stat-info">
              <div className="stat-value">{availableCount}</div>
              <div className="stat-label">Tankers Ready Now</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">🛡️</div>
            <div className="stat-info">
              <div className="stat-value">{verifiedCount}</div>
              <div className="stat-label">Verified Suppliers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">₹</div>
            <div className="stat-info">
              <div className="stat-value">₹{minRate}</div>
              <div className="stat-label">Starting Rate / 1,000L</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">🤝</div>
            <div className="stat-info">
              <div className="stat-value">Active</div>
              <div className="stat-label">Neighborhood Pooling</div>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs: Discovery vs Active Tracking */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '20px',
            paddingBottom: '4px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'DISCOVERY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '40px', padding: '8px 18px', fontSize: '0.88rem' }}
              onClick={() => setActiveTab('DISCOVERY')}
            >
              🗺️ Discover & Order
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'TRACKER' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '40px', padding: '8px 18px', fontSize: '0.88rem' }}
              onClick={() => setActiveTab('TRACKER')}
            >
              🚚 Track Active Delivery
              {(bookings.length > 0 || activeRequest) && (
                <span
                  style={{
                    backgroundColor: activeTab === 'TRACKER' ? 'white' : 'var(--color-primary)',
                    color: activeTab === 'TRACKER' ? 'var(--color-primary-dark)' : 'white',
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '99px',
                    fontWeight: 800,
                  }}
                >
                  {bookings.length || 1}
                </span>
              )}
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing tankers within 10 km radius
          </div>
        </div>

        {errorNotice && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              color: '#be123c',
              marginBottom: '16px',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {errorNotice}
          </div>
        )}

        {/* Main Content Area Based on Tab */}
        {activeTab === 'DISCOVERY' ? (
          <div className="view-grid">
            {/* Left: Leaflet Interactive Map */}
            <TankerMap
              tankers={tankers}
              currentLocation={currentLocation}
              selectedTanker={selectedTanker}
              onSelectTanker={(t) => setSelectedTanker(t)}
              onRequestTanker={handleOpenRequest}
            />

            {/* Right: Tanker Directory & Cards */}
            <TankerList
              tankers={tankers}
              selectedTanker={selectedTanker}
              onSelectTanker={(t) => setSelectedTanker(t)}
              onRequestTanker={handleOpenRequest}
              isLoading={isLoadingTankers}
            />
          </div>
        ) : (
          /* Live Booking Tracker View */
          <div>
            <BookingTimeline
              bookings={bookings}
              activeRequest={activeRequest}
              tankers={tankers}
              onRefresh={async () => {
                await loadBookings();
                await loadTankers();
              }}
            />

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveTab('DISCOVERY')}
              >
                ← Back to Tanker Discovery & Map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Water Request Modal */}
      <WaterRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        tanker={modalTargetTanker}
        currentLocation={currentLocation}
        localityName={localityName}
        onSubmitRequest={handleSubmitRequest}
      />

      {/* Demand Pooling Offer Modal */}
      <PoolingModal
        isOpen={isPoolingModalOpen}
        onClose={() => setIsPoolingModalOpen(false)}
        poolOffer={poolingOffer}
        onAcceptPool={handleAcceptPool}
        onDeclinePool={handleDeclinePool}
      />
    </main>
  );
}
