import React, { useEffect, useState } from 'react';
import { demoDriverInstance } from '../../services/demoDriver.js';

export function SimulationControl({ tanker, onLocationUpdated }) {
  const [telemetry, setTelemetry] = useState(() => demoDriverInstance.getCurrentPosition());
  const [isRunning, setIsRunning] = useState(() => demoDriverInstance.isRunning());
  const [intervalMs, setIntervalMs] = useState(3500);

  useEffect(() => {
    // Sync driver with current tanker ID
    if (tanker?.tankerId) {
      demoDriverInstance.tankerId = tanker.tankerId;
    }

    const unsubscribe = demoDriverInstance.subscribe((pos) => {
      setTelemetry(pos);
      setIsRunning(demoDriverInstance.isRunning());
      if (onLocationUpdated) {
        onLocationUpdated(pos);
      }
    });

    return () => unsubscribe();
  }, [tanker?.tankerId, onLocationUpdated]);

  const handleStart = () => {
    demoDriverInstance.start();
    setIsRunning(true);
  };

  const handlePause = () => {
    demoDriverInstance.pause();
    setIsRunning(false);
  };

  const handleStop = () => {
    demoDriverInstance.stop();
    setIsRunning(false);
  };

  const handleStep = async () => {
    const nextPos = await demoDriverInstance.step();
    setTelemetry(nextPos);
  };

  return (
    <div className="simulation-control card">
      <div className="section-title-row">
        <div>
          <div className="title-with-badge">
            <h3 className="section-title">Tanker Route GPS Simulation</h3>
            <span className="sim-badge">SIMULATED TELEMETRY</span>
          </div>
          <p className="section-subtitle">
            Simulates periodic vehicle movement along demonstration routes in Chhatrapati Sambhajinagar.
            Architecturally swappable with hardware GPS without changing booking contracts.
          </p>
        </div>

        <div className="sim-action-buttons">
          {!isRunning ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStart}
              id="btn-sim-start"
            >
              ▶ Start Simulation
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-warning"
              onClick={handlePause}
              id="btn-sim-pause"
            >
              ⏸ Pause
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleStep}
            id="btn-sim-step"
            title="Advance tanker by one discrete coordinate step"
          >
            ⏭ Single Step
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleStop}
            id="btn-sim-stop"
            title="Reset simulation to route starting point"
          >
            ⏹ Reset Route
          </button>
        </div>
      </div>

      <div className="telemetry-dashboard">
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">Latitude</span>
            <span className="telemetry-value font-mono">
              {telemetry.latitude ? telemetry.latitude.toFixed(6) : '—'}° N
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Longitude</span>
            <span className="telemetry-value font-mono">
              {telemetry.longitude ? telemetry.longitude.toFixed(6) : '—'}° E
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Simulated Speed</span>
            <span className="telemetry-value">
              {isRunning ? `${telemetry.speedKmph || 28} km/h` : '0 km/h (Stationary)'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Heading Bearing</span>
            <span className="telemetry-value">
              {telemetry.headingDeg !== undefined ? `${telemetry.headingDeg}°` : '—'}
            </span>
          </div>
        </div>

        <div className="waypoint-tracker">
          <div className="waypoint-info">
            <span className="wp-indicator">📍</span>
            <div className="wp-text">
              <span className="wp-title">Current Leg / Waypoint:</span>
              <span className="wp-name">{telemetry.label || 'Cidco Sector N-5 Water Depot'}</span>
            </div>
            <div className="wp-progress-percent">
              {telemetry.progressPercent || 0}% Complete
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${telemetry.progressPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="telemetry-footer">
          <span className="telemetry-disclaimer">
            ℹ️ Coordinates are persisted to backend via <code>POST /tankers/{tanker?.tankerId}/location</code> on each update step.
          </span>
          <span className="timestamp-note">
            Transmitted: {new Date(telemetry.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
