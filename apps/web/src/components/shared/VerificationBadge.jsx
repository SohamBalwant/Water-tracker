import React from 'react';

export function VerificationBadge({ status }) {
  const isVerified = status === 'VERIFIED';

  return (
    <span
      className={`verification-badge ${isVerified ? 'verified' : 'unverified'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: isVerified ? '#ecfdf5' : '#fefce8',
        color: isVerified ? '#065f46' : '#854d0e',
        border: `1px solid ${isVerified ? '#a7f3d0' : '#fef08a'}`,
      }}
      title={
        isVerified
          ? 'Registered operator with submitted business documentation.'
          : 'Self-registered listing without completed document verification.'
      }
    >
      <span>{isVerified ? '🛡️' : '⚠️'}</span>
      <span>{isVerified ? 'Verified Operator' : 'Unverified Listing'}</span>
    </span>
  );
}
