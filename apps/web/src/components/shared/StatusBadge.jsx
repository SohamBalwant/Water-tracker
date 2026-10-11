import React from 'react';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  BUSY: { label: 'Busy / Loading', bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  EN_ROUTE: { label: 'En Route', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  DELIVERED: { label: 'Delivered', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  OFFLINE: { label: 'Offline', bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
  OPEN: { label: 'Open Request', bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
  MATCHED: { label: 'Pool Matched', bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  ACCEPTED: { label: 'Accepted', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  CANCELLED: { label: 'Cancelled', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  VERIFIED: { label: 'Verified', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  UNVERIFIED: { label: 'Unverified', bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: '#f3f4f6',
    text: '#374151',
    border: '#d1d5db',
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: config.bg,
    color: config.text,
    border: `1px solid ${config.border}`,
    borderRadius: '9999px',
    padding: size === 'sm' ? '0.2rem 0.65rem' : '0.35rem 0.85rem',
    fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
  };

  return (
    <span style={style} className={`status-badge status-${status?.toLowerCase()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: config.text }} />
      {config.label}
    </span>
  );
}
