import React from 'react';

export function AdminPage() {
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
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
          Portal Administration & Oversight
        </h2>
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <span className="badge badge-simulated">Person 3 Ownership Module</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          This interface is assigned to <strong>Person 3</strong> (`feat/operator-admin`).
          It will feature supplier verification management, community shortage reports review, and transparent pricing discrepancy oversight.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
          Please select <strong>Resident Experience</strong> in the top navigation to test Person 1's implemented interactive map and water booking workflows.
        </p>
      </div>
    </div>
  );
}
