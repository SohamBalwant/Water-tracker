import React, { useState } from 'react';

export const DEMO_LOCALITIES = [
  { name: 'Cidco Sector N-5', lat: 19.8762, lng: 75.3433 },
  { name: 'MGM Sports Complex Area', lat: 19.8820, lng: 75.3490 },
  { name: 'Kranti Chowk Circle', lat: 19.8740, lng: 75.3380 },
  { name: 'Garkheda Parisar', lat: 19.8690, lng: 75.3520 },
  { name: 'Seven Hills / Jalna Road', lat: 19.8790, lng: 75.3560 },
  { name: 'Waluj MIDC Industrial Area', lat: 19.8550, lng: 75.3200 },
];

export function LocationBar({
  currentLocation,
  onLocationChange,
  localityName,
}) {
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocalitySelect = (e) => {
    const selected = DEMO_LOCALITIES.find((loc) => loc.name === e.target.value);
    if (selected) {
      setGeoError(null);
      onLocationChange({ lat: selected.lat, lng: selected.lng, name: selected.name });
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser geolocation is not supported on this device.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        onLocationChange({
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          name: 'My Current Location (GPS)',
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Switched to manual locality selection.');
        } else {
          setGeoError('Unable to retrieve device coordinates. Please choose a demo area.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="location-bar">
      <div className="container">
        <div className="location-bar-inner">
          <div className="location-current">
            <div className="location-icon-bubble" aria-hidden="true">
              📍
            </div>
            <div className="location-text">
              <h2>
                {localityName || 'Select Locality'}
                <span className="badge badge-simulated">Demo Zone</span>
              </h2>
              <p>
                Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)} • Chhatrapati Sambhajinagar
              </p>
            </div>
          </div>

          <div className="location-actions">
            <label htmlFor="locality-dropdown" className="sr-only" style={{ display: 'none' }}>
              Choose Locality
            </label>
            <select
              id="locality-dropdown"
              className="locality-select"
              value={DEMO_LOCALITIES.some((l) => l.name === localityName) ? localityName : ''}
              onChange={handleLocalitySelect}
              aria-label="Select demo locality"
            >
              <option value="" disabled>
                -- Select Demo Locality --
              </option>
              {DEMO_LOCALITIES.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              id="btn-use-gps"
              className="btn btn-secondary btn-gps"
              onClick={handleUseGps}
              disabled={isLocating}
              title="Detect device coordinates via browser geolocation"
            >
              {isLocating ? 'Detecting GPS...' : '📍 Use My GPS'}
            </button>
          </div>
        </div>

        {geoError && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              color: '#9f1239',
              fontSize: '0.82rem',
            }}
          >
            ⚠️ {geoError}
          </div>
        )}
      </div>
    </div>
  );
}
