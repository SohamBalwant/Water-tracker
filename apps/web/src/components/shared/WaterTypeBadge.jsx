import React from 'react';

export function WaterTypeBadge({ waterType }) {
  const isDrinking = waterType === 'DRINKING';
  const isNonDrinking = waterType === 'NON_DRINKING';

  return (
    <span
      className={`water-type-badge ${isDrinking ? 'drinking' : 'non-drinking'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: isDrinking ? '#e0f2fe' : '#f1f5f9',
        color: isDrinking ? '#0369a1' : '#475569',
        border: `1px solid ${isDrinking ? '#bae6fd' : '#cbd5e1'}`,
      }}
      title={
        isDrinking
          ? 'Operator-declared drinking utility water. Not independent potability test.'
          : 'Non-drinking / Utility water (washing, construction, sanitation).'
      }
    >
      <span>{isDrinking ? '💧' : '🪣'}</span>
      <span>{isDrinking ? 'Drinking Utility' : isNonDrinking ? 'Non-Drinking Utility' : 'Unspecified'}</span>
    </span>
  );
}
