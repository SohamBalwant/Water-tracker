import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export function TankerMap({
  tankers = [],
  currentLocation,
  selectedTanker,
  onSelectTanker,
  onRequestTanker,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const residentMarkerRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLocation.lat, currentLocation.lng],
          zoom: 14,
          scrollWheelZoom: false,
        });

        // Standard OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        residentMarkerRef.current = null;
      }
    };
  }, []);

  // Update Resident Location Marker & View
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentLocation) return;

    map.setView([currentLocation.lat, currentLocation.lng], map.getZoom() || 14);

    if (residentMarkerRef.current) {
      residentMarkerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
    } else {
      const residentIcon = L.divIcon({
        className: 'custom-tanker-marker marker-resident',
        html: '<span aria-label="Your location">📍</span>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const resMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: residentIcon,
        title: 'Your Location',
        zIndexOffset: 1000,
      }).addTo(map);

      resMarker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">📍 Your Location</strong>
          <span style="font-size: 12px; color: #475569;">Delivery coordinate destination</span>
        </div>
      `);

      residentMarkerRef.current = resMarker;
    }
  }, [currentLocation]);

  // Render Tanker Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    tankers.forEach((tanker) => {
      if (
        typeof tanker.latitude !== 'number' ||
        typeof tanker.longitude !== 'number' ||
        Number.isNaN(tanker.latitude) ||
        Number.isNaN(tanker.longitude)
      ) {
        return; // Skip invalid coordinates
      }

      const isSelected = selectedTanker && selectedTanker.tankerId === tanker.tankerId;

      let markerClass = 'marker-available';
      let symbol = '💧';
      if (tanker.status === 'BUSY') {
        markerClass = 'marker-busy';
        symbol = '⏳';
      } else if (tanker.status === 'EN_ROUTE') {
        markerClass = 'marker-enroute';
        symbol = '🚚';
      }

      const icon = L.divIcon({
        className: `custom-tanker-marker ${markerClass}`,
        html: `<span aria-label="${tanker.status}">${symbol}</span>`,
        iconSize: isSelected ? [42, 42] : [34, 34],
        iconAnchor: isSelected ? [21, 21] : [17, 17],
      });

      const marker = L.marker([tanker.latitude, tanker.longitude], {
        icon,
        title: tanker.displayName,
      });

      // Construct popup content
      const popupHtml = document.createElement('div');
      popupHtml.style.fontFamily = 'system-ui, sans-serif';
      popupHtml.style.minWidth = '200px';

      popupHtml.innerHTML = `
        <div style="margin-bottom: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${tanker.displayName}</h4>
          <div style="display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap;">
            <span style="background: ${tanker.status === 'AVAILABLE' ? '#ecfdf5' : '#fffbeb'}; color: ${tanker.status === 'AVAILABLE' ? '#065f46' : '#92400e'}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 99px;">${tanker.status}</span>
            <span style="background: #f1f5f9; color: #334155; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 99px;">${tanker.waterType.replace('_', ' ')}</span>
            <span style="background: ${tanker.verificationStatus === 'VERIFIED' ? '#f0fdf4' : '#f8fafc'}; color: ${tanker.verificationStatus === 'VERIFIED' ? '#166534' : '#64748b'}; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 99px;">${tanker.verificationStatus}</span>
          </div>
          <div style="font-size: 12px; color: #334155; line-height: 1.4;">
            <div><strong>Capacity:</strong> ${tanker.availableLitres?.toLocaleString() || 0}L available / ${tanker.capacityLitres?.toLocaleString() || 0}L</div>
            <div><strong>Transparent Rate:</strong> ₹${tanker.pricePer1000Litres} / 1,000L</div>
            ${tanker.distanceKm ? `<div><strong>Distance:</strong> ${tanker.distanceKm} km away</div>` : ''}
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Source: ${tanker.locationSource}</div>
          </div>
        </div>
      `;

      const selectBtn = document.createElement('button');
      selectBtn.innerText = 'Select Tanker';
      selectBtn.style.width = '100%';
      selectBtn.style.padding = '6px 10px';
      selectBtn.style.background = '#0077b6';
      selectBtn.style.color = '#ffffff';
      selectBtn.style.border = 'none';
      selectBtn.style.borderRadius = '6px';
      selectBtn.style.fontWeight = '600';
      selectBtn.style.fontSize = '12px';
      selectBtn.style.cursor = 'pointer';

      selectBtn.onclick = () => {
        onSelectTanker(tanker);
        marker.closePopup();
      };

      popupHtml.appendChild(selectBtn);

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectTanker(tanker);
      });

      markersLayer.addLayer(marker);
    });
  }, [tankers, selectedTanker, onSelectTanker]);

  // Center on selected tanker if selected externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedTanker && typeof selectedTanker.latitude === 'number') {
      map.panTo([selectedTanker.latitude, selectedTanker.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedTanker]);

  if (mapError) {
    return (
      <div className="map-card-wrapper">
        <div className="map-fallback-box">
          <h3>Interactive Map Unavailable</h3>
          <p>Leaflet map failed to initialize. You can still select available tankers directly from the directory below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-card-wrapper" aria-label="Interactive Tanker Map">
      <div className="map-card-header">
        <div className="map-card-title">
          <span>🗺️ Nearby Tanker Map</span>
          <span className="badge badge-simulated">Simulated GPS</span>
        </div>

        <div className="map-legend" aria-hidden="true">
          <div className="legend-item">
            <span className="legend-dot available"></span> Available
          </div>
          <div className="legend-item">
            <span className="legend-dot busy"></span> Busy
          </div>
          <div className="legend-item">
            <span className="legend-dot enroute"></span> En Route
          </div>
          <div className="legend-item">
            <span className="legend-dot resident"></span> You
          </div>
        </div>
      </div>

      <div
        id="resident-leaflet-map"
        ref={mapContainerRef}
        className="leaflet-map-container"
        tabIndex={0}
        role="region"
        aria-label="Map showing water tanker positions in locality"
      />
    </div>
  );
}
