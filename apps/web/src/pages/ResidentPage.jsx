import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { residentApi } from '../services/residentApi.js';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { FreshnessIndicator } from '../components/shared/FreshnessIndicator.jsx';
import { WaterTypeBadge } from '../components/shared/WaterTypeBadge.jsx';
import { VerificationBadge } from '../components/shared/VerificationBadge.jsx';
import { NoticeBanner } from '../components/shared/NoticeBanner.jsx';
import { TankerStatus } from '../../../../shared/types.js';

const LOCALITIES = [
  { name: 'Cidco Sector N-5, Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433 },
  { name: 'TV Centre Square, Chhatrapati Sambhajinagar', lat: 19.8795, lng: 75.3490 },
  { name: 'Samarth Nagar West, Chhatrapati Sambhajinagar', lat: 19.8805, lng: 75.3420 },
  { name: 'Beed Bypass Colony, Chhatrapati Sambhajinagar', lat: 19.8705, lng: 75.3540 },
  { name: 'Waluj MIDC Area, Chhatrapati Sambhajinagar', lat: 19.8450, lng: 75.2500 },
];

export function ResidentPage() {
  const [selectedLocality, setSelectedLocality] = useState(LOCALITIES[0]);
  const [tankers, setTankers] = useState([]);
  const [selectedTanker, setSelectedTanker] = useState(null);
  const [quantity, setQuantity] = useState(1000);
  const [waterType, setWaterType] = useState('NON_DRINKING');
  const [deliveryWindow, setDeliveryWindow] = useState('2026-10-11T12:00:00.000Z');
  const [requestResult, setRequestResult] = useState(null);
  const [poolingOffer, setPoolingOffer] = useState(null);
  const [activeTracking, setActiveTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shortageText, setShortageText] = useState('');
  const [shortageSuccess, setShortageSuccess] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Load nearby tankers
  useEffect(() => {
    async function fetchTankers() {
      try {
        setLoading(true);
        const data = await residentApi.getNearbyTankers(selectedLocality.lat, selectedLocality.lng);
        setTankers(data);
        if (data.length > 0) {
          setSelectedTanker(data[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load available tankers.');
      } finally {
        setLoading(false);
      }
    }
    fetchTankers();
  }, [selectedLocality]);

  // Leaflet Map Initialization & Updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocality.lat, selectedLocality.lng],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([selectedLocality.lat, selectedLocality.lng], 14);
    }

    // Refresh Markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // Locality Marker
      const residentIcon = L.divIcon({
        className: 'custom-map-pin resident-pin',
        html: `<div style="background-color: #0284c7; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🏠</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([selectedLocality.lat, selectedLocality.lng], { icon: residentIcon })
        .bindPopup(`<strong>Your Location:</strong><br>${selectedLocality.name}`)
        .addTo(markersLayerRef.current);

      // Tanker Markers
      tankers.forEach(t => {
        if (!t.latitude || !t.longitude) return;
        const isAvailable = t.status === TankerStatus.AVAILABLE;
        const isSelected = selectedTanker?.tankerId === t.tankerId;

        const tankerIcon = L.divIcon({
          className: 'custom-map-pin tanker-pin',
          html: `<div style="background-color: ${isSelected ? '#f59e0b' : isAvailable ? '#059669' : '#64748b'}; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🚚</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([t.latitude, t.longitude], { icon: tankerIcon })
          .bindPopup(`
            <strong>${t.displayName}</strong><br>
            Capacity: ${t.availableLitres}/${t.capacityLitres}L<br>
            Status: ${t.status}<br>
            Rate: ₹${t.pricePer1000Litres}/1000L
          `);

        marker.on('click', () => setSelectedTanker(t));
        marker.addTo(markersLayerRef.current);
      });
    }

    return () => {
      // Map cleanup on unmount handled in parent if destroyed
    };
  }, [selectedLocality, tankers, selectedTanker]);

  // Clean up Leaflet on page unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleLocalityChange = (e) => {
    const loc = LOCALITIES.find(l => l.name === e.target.value) || LOCALITIES[0];
    setSelectedLocality(loc);
  };

  const handleBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocality({
            name: 'Device GPS Location',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          alert('Location permission was denied. Continuing with selected demonstration locality.');
        }
      );
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (quantity < 100 || quantity > 25000) {
      alert('Please enter a valid water volume between 100 and 25,000 litres.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const req = await residentApi.createWaterRequest({
        requesterId: 'resident-demo-user',
        locality: selectedLocality.name,
        quantityLitres: Number(quantity),
        latitude: selectedLocality.lat,
        longitude: selectedLocality.lng,
        deliveryWindowStart: deliveryWindow,
        waterType,
      });

      setRequestResult(req);
      setActiveTracking(req);

      // Seek pooling candidate
      const poolCheck = await residentApi.joinPool(req.requestId);
      if (poolCheck && poolCheck.eligible) {
        setPoolingOffer(poolCheck);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit water request.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPool = () => {
    alert(`Pooling offer confirmed! Your booking is grouped under candidate booking #${poolingOffer.candidateBookingId} with shared trip savings.`);
    setPoolingOffer(null);
  };

  const handleDeclinePool = () => {
    setPoolingOffer(null);
  };

  const handleReportShortage = async (e) => {
    e.preventDefault();
    if (!shortageText.trim()) return;
    try {
      await residentApi.reportWaterShortage({
        reporterId: 'resident-demo-user',
        locality: selectedLocality.name,
        latitude: selectedLocality.lat,
        longitude: selectedLocality.lng,
        description: shortageText,
      });
      setShortageSuccess(true);
      setShortageText('');
      setTimeout(() => setShortageSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    }
  };

  return (
    <div className="resident-page">
      <NoticeBanner
        type="info"
        message="Resident Water Access Portal — Discover verified water tankers, request individual deliveries, or pool demand with neighborhood households in Chhatrapati Sambhajinagar."
      />

      <div className="resident-hero">
        <h2>WaterSaathi: Reliable Tanker Water When You Need It</h2>
        <p>
          Discover nearby tankers, inspect transparent rate cards, and combine demand with neighbors for shared trips.
        </p>
      </div>

      {/* Locality Selector */}
      <div className="location-picker-bar">
        <span className="loc-icon">📍</span>
        <div className="loc-select-wrap">
          <label className="input-label" htmlFor="res-locality">Locality in Chhatrapati Sambhajinagar</label>
          <select
            id="res-locality"
            className="form-select"
            value={selectedLocality.name}
            onChange={handleLocalityChange}
          >
            {LOCALITIES.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleBrowserLocation}
        >
          🎯 Use Browser Location
        </button>
      </div>

      {/* Map View */}
      <div className="resident-map-container" ref={mapContainerRef}>
        <div className="map-placeholder-notice">
          📍 Map view: {tankers.length} tankers nearby
        </div>
      </div>

      {/* 2-Column Content Area */}
      <div className="resident-content-grid">
        {/* Left Column: Nearby Tankers List */}
        <div className="tankers-list-panel card">
          <div className="section-title-row">
            <div>
              <h3 className="section-title">Nearby Available Tankers ({tankers.length})</h3>
              <p className="section-subtitle">Select a tanker to inspect verified rates and capacity.</p>
            </div>
          </div>

          <div className="tankers-list-scroll">
            {tankers.map(t => {
              const isSelected = selectedTanker?.tankerId === t.tankerId;
              return (
                <div
                  key={t.tankerId}
                  className={`resident-tanker-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTanker(t)}
                >
                  <div className="rt-header">
                    <span className="rt-name">{t.displayName}</span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="rt-metrics">
                    <span>Capacity: <strong>{t.availableLitres?.toLocaleString()}L</strong> / {t.capacityLitres?.toLocaleString()}L</span>
                    <span>Rate: <strong>₹{t.pricePer1000Litres}</strong> / 1000L</span>
                  </div>
                  <div className="rt-header">
                    <WaterTypeBadge waterType={t.waterType} />
                    <VerificationBadge status={t.verificationStatus} />
                  </div>
                  <FreshnessIndicator timestamp={t.lastLocationUpdate} source={t.locationSource} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Request Form & Pooling Offers */}
        <div className="request-form-panel card">
          <h3 className="section-title">Request Water Delivery</h3>
          <p className="section-subtitle">Submit requirements to receive an authoritative quote.</p>

          <form onSubmit={handleSubmitRequest} className="mt-3">
            <div className="mb-3">
              <label className="input-label" htmlFor="qty-input">Required Quantity (Litres)</label>
              <input
                id="qty-input"
                type="number"
                min="100"
                max="25000"
                step="100"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <span className="text-xs text-muted">Standard household order: 1,000L &ndash; 2,000L</span>
            </div>

            <div className="mb-3">
              <label className="input-label" htmlFor="water-type-input">Water Utility Category</label>
              <select
                id="water-type-input"
                className="form-select"
                value={waterType}
                onChange={(e) => setWaterType(e.target.value)}
              >
                <option value="NON_DRINKING">Non-Drinking / Utility Water (Washing, Borehole)</option>
                <option value="DRINKING">Drinking Utility (Operator declared)</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="input-label" htmlFor="window-input">Desired Delivery Window</label>
              <select
                id="window-input"
                className="form-select"
                value={deliveryWindow}
                onChange={(e) => setDeliveryWindow(e.target.value)}
              >
                <option value="2026-10-11T12:00:00.000Z">Today, 12:00 PM &ndash; 02:00 PM</option>
                <option value="2026-10-11T14:00:00.000Z">Today, 02:00 PM &ndash; 04:00 PM</option>
                <option value="2026-10-11T16:00:00.000Z">Today, 04:00 PM &ndash; 06:00 PM</option>
              </select>
            </div>

            <div className="quote-preview-box card mb-3">
              <span className="text-xs text-muted">Transparent Quote Estimate:</span>
              <div className="font-semibold text-lg text-primary">
                ₹{Math.round((quantity / 1000) * (selectedTanker?.pricePer1000Litres || 500))}
              </div>
              <span className="text-xs text-muted">
                Based on ₹{selectedTanker?.pricePer1000Litres || 500}/1,000L. Final quote calculated authoritatively by backend.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
              id="btn-submit-request"
            >
              {loading ? 'Submitting...' : '✓ Submit Water Request'}
            </button>
          </form>

          {/* Demand Pooling Offer Notification */}
          {poolingOffer && (
            <div className="pool-offer-banner mt-3">
              <div className="pool-offer-header">
                <span className="text-xl">🤝</span>
                <span className="pool-offer-title">Demand Pooling Match Available!</span>
              </div>
              <p className="text-sm">
                A nearby household in your sector has requested delivery in the same time window. Combining this trip reduces delivery deadhead.
              </p>
              <div className="pool-details-grid">
                <div>
                  <span className="text-xs text-muted">Combined Pool:</span>
                  <div className="font-bold">{poolingOffer.combinedQuantityLitres} L</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Your Share Quote:</span>
                  <div className="font-bold text-success">₹{poolingOffer.quotedPrice}</div>
                </div>
              </div>
              <div className="pool-action-row">
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={handleConfirmPool}
                  id="btn-confirm-pool"
                >
                  ✓ Accept Shared Delivery
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleDeclinePool}
                >
                  Keep Single Order
                </button>
              </div>
            </div>
          )}

          {/* Active Request Tracking */}
          {activeTracking && (
            <div className="tracking-timeline-card mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="font-bold text-sm">Order Tracking #{activeTracking.requestId}</h4>
                <StatusBadge status={activeTracking.status} size="sm" />
              </div>

              <div className="timeline-steps">
                <div className={`timeline-step ${activeTracking.status ? 'completed' : ''}`}>
                  <div className="step-circle">1</div>
                  <span className="step-label">Requested</span>
                </div>
                <div className={`timeline-step ${activeTracking.status === 'ACCEPTED' || activeTracking.status === 'EN_ROUTE' || activeTracking.status === 'DELIVERED' ? 'completed' : activeTracking.status === 'MATCHED' ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <span className="step-label">Matched</span>
                </div>
                <div className={`timeline-step ${activeTracking.status === 'EN_ROUTE' || activeTracking.status === 'DELIVERED' ? 'completed' : activeTracking.status === 'ACCEPTED' ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span className="step-label">En Route</span>
                </div>
                <div className={`timeline-step ${activeTracking.status === 'DELIVERED' ? 'completed' : ''}`}>
                  <div className="step-circle">4</div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community Shortage Reporting */}
      <div className="shortage-report-section card">
        <h3 className="section-title">Report a Local Water Shortage</h3>
        <p className="section-subtitle">
          Submit community alerts regarding dried borewells or delayed municipal distribution in your neighborhood.
        </p>

        {shortageSuccess && (
          <div className="status-feedback feedback-success mt-2">
            ✓ Report received and registered under unverified community alerts for municipal audit.
          </div>
        )}

        <form onSubmit={handleReportShortage} className="mt-2 d-flex gap-2">
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Society borewell dry for 3 days; pipeline pressure zero in Sector N-5."
            value={shortageText}
            onChange={(e) => setShortageText(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
