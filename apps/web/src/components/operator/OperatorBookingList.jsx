import React, { useState } from 'react';
import { BookingCard } from './BookingCard.jsx';
import { BookingStatus } from '../../shared/types.js';

export function OperatorBookingList({
  bookings = [],
  onAccept,
  onReject,
  onUpdateStatus,
  actionLoading,
}) {
  const [activeTab, setActiveTab] = useState('ALL');

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.OPEN || b.status === BookingStatus.MATCHED);
  const activeBookings = bookings.filter(b => b.status === BookingStatus.ACCEPTED || b.status === BookingStatus.EN_ROUTE);
  const completedBookings = bookings.filter(b => b.status === BookingStatus.DELIVERED);
  const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'PENDING': return pendingBookings;
      case 'ACTIVE': return activeBookings;
      case 'COMPLETED': return completedBookings;
      case 'CANCELLED': return cancelledBookings;
      default: return bookings;
    }
  };

  const filtered = getFilteredBookings();

  return (
    <div className="operator-bookings-section">
      <div className="bookings-header-row">
        <div>
          <h3 className="section-title">Assigned Bookings &amp; Delivery Queue</h3>
          <p className="section-subtitle">
            Review single household requests and combined demand pool bookings awaiting dispatch or fulfillment.
          </p>
        </div>

        <div className="filter-pill-tabs" role="tablist">
          <button
            type="button"
            className={`filter-pill ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            Active ({activeBookings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Delivered ({completedBookings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setActiveTab('CANCELLED')}
          >
            Cancelled ({cancelledBookings.length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state-card card">
          <div className="empty-state-icon">📭</div>
          <h4 className="empty-state-title">No bookings in this tab</h4>
          <p className="empty-state-desc">
            {activeTab === 'PENDING'
              ? 'No pending booking requests awaiting operator action at this moment.'
              : activeTab === 'ACTIVE'
              ? 'No deliveries currently in transit. Accept a booking to start delivery.'
              : 'No orders match this filter.'}
          </p>
        </div>
      ) : (
        <div className="booking-cards-list">
          {filtered.map(booking => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onAccept={onAccept}
              onReject={onReject}
              onUpdateStatus={onUpdateStatus}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
