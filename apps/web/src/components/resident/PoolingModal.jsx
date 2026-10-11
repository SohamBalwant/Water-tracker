import React from 'react';

export function PoolingModal({
  isOpen,
  onClose,
  poolOffer,
  onAcceptPool,
  onDeclinePool,
}) {
  if (!isOpen || !poolOffer) return null;

  const {
    candidateTankerName,
    combinedQuantityLitres = 3000,
    individualLitres = 1000,
    quotedPrice = 475,
    standardPrice = 500,
    savingsInr = 25,
    message,
    matchedRequestsCount = 2,
  } = poolOffer;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pooling-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-pooling-title">
            <span>🤝 Community Water Demand Pool</span>
          </h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="pooling-hero-box">
            <span className="pooling-badge-tag">Compatible Demand Found</span>
            <h4 className="pooling-hero-title">Coordinated Neighborhood Delivery</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {message ||
                `A nearby household in your locality requested water within the same delivery window.`}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            <div>
              <strong>Assigned Tanker:</strong> {candidateTankerName || 'Nearby Tanker'}
            </div>
            <div>
              <strong>Combined Load:</strong> {combinedQuantityLitres.toLocaleString()} Litres ({matchedRequestsCount} households)
            </div>
            <div>
              <strong>Your Share:</strong> {individualLitres.toLocaleString()} Litres
            </div>
          </div>

          <div className="pooling-comparison-grid">
            <div className="comparison-card solo">
              <div className="comparison-title">Solo Trip</div>
              <div className="comparison-price">₹{standardPrice.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Standard single delivery
              </div>
            </div>

            <div className="comparison-card pooled">
              <div className="comparison-title">Shared Pool</div>
              <div className="comparison-price">₹{quotedPrice.toLocaleString()}</div>
              {savingsInr > 0 ? (
                <span className="comparison-savings-pill">Save ₹{savingsInr}</span>
              ) : (
                <span className="comparison-savings-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  Coordinated
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              marginBottom: '20px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
            }}
          >
            ℹ️ <strong>Coordination Notice:</strong> Pooling combines compatible nearby requests so that one tanker fulfills multiple households on a coordinated route. Each household maintains its own delivery tracking and individual quantity.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onDeclinePool}
              id="btn-decline-pool"
            >
              Keep Solo Order (₹{standardPrice})
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAcceptPool}
              id="btn-accept-pool"
            >
              Join Shared Pool (₹{quotedPrice})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
