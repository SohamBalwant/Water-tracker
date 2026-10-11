import React, { useState, useEffect, useCallback } from 'react';
import { operatorApi } from '../services/operatorApi.js';
import { demoDriverInstance } from '../services/demoDriver.js';
import { OperatorHeader } from '../components/operator/OperatorHeader.jsx';
import { TankerStatusControl } from '../components/operator/TankerStatusControl.jsx';
import { SimulationControl } from '../components/operator/SimulationControl.jsx';
import { OperatorBookingList } from '../components/operator/OperatorBookingList.jsx';
import { ActiveTripBanner } from '../components/operator/ActiveTripBanner.jsx';
import { NoticeBanner } from '../components/shared/NoticeBanner.jsx';
import { BookingStatus, TankerStatus } from '../../../../shared/types.js';

export function OperatorPage() {
  const [tankers, setTankers] = useState([]);
  const [selectedTankerId, setSelectedTankerId] = useState('tanker-001');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const selectedTanker = tankers.find(t => t.tankerId === selectedTankerId) || tankers[0];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tankerList, bookingList] = await Promise.all([
        operatorApi.getTankers(),
        operatorApi.getBookings(),
      ]);

      setTankers(tankerList);
      setBookings(bookingList);
      if (tankerList.length > 0 && !tankerList.some(t => t.tankerId === selectedTankerId)) {
        setSelectedTankerId(tankerList[0].tankerId);
      }
    } catch (err) {
      console.error('[OperatorPage] Failed to load data:', err);
      setError(err.message || 'Failed to load operator records.');
    } finally {
      setLoading(false);
    }
  }, [selectedTankerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Tanker Status Change (e.g. AVAILABLE, BUSY, EN_ROUTE, OFFLINE)
  const handleTankerStatusChange = async (tankerId, newStatus) => {
    setActionLoading(true);
    try {
      await operatorApi.updateTankerStatus(tankerId, newStatus);
      setTankers(prev => prev.map(t => t.tankerId === tankerId ? { ...t, status: newStatus } : t));
      setFeedback({ type: 'success', text: `Tanker status updated to ${newStatus}.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Status update failed.' });
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Accept a booking
  const handleAcceptBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await operatorApi.acceptBooking(bookingId);
      setFeedback({ type: 'success', text: `Booking #${bookingId} accepted successfully.` });
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to accept booking.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject a booking
  const handleRejectBooking = async (bookingId, reason) => {
    setActionLoading(true);
    try {
      await operatorApi.rejectBooking(bookingId, reason);
      setFeedback({ type: 'info', text: `Booking #${bookingId} rejected.` });
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to reject booking.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Booking Status (e.g. EN_ROUTE, DELIVERED)
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      await operatorApi.updateBookingStatus(bookingId, newStatus);
      setFeedback({ type: 'success', text: `Booking #${bookingId} marked as ${newStatus}.` });

      if (newStatus === BookingStatus.EN_ROUTE) {
        demoDriverInstance.start();
      } else if (newStatus === BookingStatus.DELIVERED) {
        demoDriverInstance.pause();
      }

      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Status transition failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Called when simulation ticks a new coordinate
  const handleLocationUpdated = (pos) => {
    setTankers(prev => prev.map(t => {
      if (t.tankerId === selectedTankerId) {
        return {
          ...t,
          latitude: pos.latitude,
          longitude: pos.longitude,
          lastLocationUpdate: pos.timestamp,
          locationSource: pos.locationSource,
        };
      }
      return t;
    }));
  };

  // Find active booking for this tanker
  const activeBooking = bookings.find(
    b => b.tankerId === selectedTankerId && (b.status === BookingStatus.EN_ROUTE || b.status === BookingStatus.ACCEPTED)
  );

  return (
    <div className="operator-page">
      <NoticeBanner
        type="info"
        message="Operator Dispatch Console — Real-time telemetry simulation is running for Chhatrapati Sambhajinagar routes. Accepts both individual household deliveries and combined demand pool bookings."
      />

      {feedback && (
        <div className={`status-feedback feedback-${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {error && (
        <div className="status-feedback feedback-error">
          ⚠️ {error} &mdash;{' '}
          <button type="button" className="btn-link" onClick={loadData}>
            Retry loading
          </button>
        </div>
      )}

      {/* Active Trip Announcement Banner */}
      <ActiveTripBanner
        activeBooking={activeBooking}
        tanker={selectedTanker}
        onCompleteDelivery={(bId) => handleUpdateBookingStatus(bId, BookingStatus.DELIVERED)}
      />

      {/* Operator Header & Tanker Selector */}
      <OperatorHeader
        tankers={tankers}
        selectedTankerId={selectedTankerId}
        onSelectTanker={setSelectedTankerId}
        selectedTanker={selectedTanker}
      />

      {/* Operational Status Toggles */}
      <TankerStatusControl
        tanker={selectedTanker}
        onStatusChange={handleTankerStatusChange}
        isUpdating={actionLoading}
      />

      {/* Simulated GPS Telemetry Control */}
      <SimulationControl
        tanker={selectedTanker}
        onLocationUpdated={handleLocationUpdated}
      />

      {/* Bookings Queue */}
      <OperatorBookingList
        bookings={bookings}
        onAccept={handleAcceptBooking}
        onReject={handleRejectBooking}
        onUpdateStatus={handleUpdateBookingStatus}
        actionLoading={actionLoading}
      />
import React from 'react';

export function OperatorPage() {
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
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚚</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
          Tanker Operator Dashboard
        </h2>
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <span className="badge badge-simulated">Person 3 Ownership Module</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          This interface is assigned to <strong>Person 3</strong> (`feat/operator-admin`).
          It will feature booking acceptance controls, capacity status updates, and simulated GPS tanker movement.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
          Please select <strong>Resident Experience</strong> in the top navigation to test Person 1's implemented interactive map and water booking workflows.
        </p>
      </div>
    </div>
  );
}
