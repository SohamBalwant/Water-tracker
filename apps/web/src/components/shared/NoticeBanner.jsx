import React, { useState } from 'react';

export function NoticeBanner({
  message = 'Demonstration Environment: Tanker locations and availability are simulated for Chhatrapati Sambhajinagar, Maharashtra. No production identity or payment gateway is active.',
  type = 'info',
  dismissible = true,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const colors = {
    info: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a', icon: '⚠️' },
    caution: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', icon: '🚨' },
  }[type] || { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', icon: 'ℹ️' };

  return (
    <div
      className="notice-banner"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderBottom: `1px solid ${colors.border}`,
        padding: '0.6rem 1.25rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        lineHeight: 1.4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span>{colors.icon}</span>
        <span>{message}</span>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 0.25rem',
            lineHeight: 1,
            opacity: 0.75,
          }}
          aria-label="Dismiss banner"
        >
          &times;
        </button>
      )}
    </div>
  );
}
