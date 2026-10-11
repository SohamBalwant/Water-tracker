import React from 'react';

export function PriceTransparencyAudit({ tankers = [] }) {
  // Identifies tankers falling outside Maharashtra regional urban price bounds (₹150 - ₹2000 / 1000L)
  const suspiciousTankers = tankers.filter(t => {
    const rate = t.pricePer1000Litres;
    return rate < 150 || rate > 2000;
  });

  const highPricedTankers = tankers.filter(t => t.pricePer1000Litres > 1000 && t.pricePer1000Litres <= 2000);

  return (
    <div className="price-transparency-audit card">
      <div className="section-title-row">
        <div>
          <h3 className="section-title">Transparent Pricing Audit &amp; Citizen Fairness Monitor</h3>
          <p className="section-subtitle">
            Monitors operator rate cards against regional fair-pricing benchmarks (₹150 – ₹2,000 per 1,000L).
            Flags anomalies for administrative inquiry without premature claims of fraud.
          </p>
        </div>
        <div className="benchmark-pill">
          Benchmark: ₹500 / 1000L
        </div>
      </div>

      <div className="audit-summary-boxes">
        <div className="audit-box">
          <span className="audit-box-label">Monitored Fleet</span>
          <span className="audit-box-val">{tankers.length} Tankers</span>
          <span className="audit-box-sub">Registered across Sambhajinagar</span>
        </div>

        <div className="audit-box">
          <span className="audit-box-label">Suspicious Anomaly Flags</span>
          <span className={`audit-box-val ${suspiciousTankers.length > 0 ? 'text-danger' : 'text-success'}`}>
            {suspiciousTankers.length}
          </span>
          <span className="audit-box-sub">&lt; ₹150 or &gt; ₹2,000 per 1,000L</span>
        </div>

        <div className="audit-box">
          <span className="audit-box-label">Premium Utility Rates</span>
          <span className="audit-box-val text-warning">{highPricedTankers.length}</span>
          <span className="audit-box-sub">&gt; ₹1,000 per 1,000L (Drinking/Emergency)</span>
        </div>
      </div>

      {suspiciousTankers.length > 0 ? (
        <div className="suspicious-alert-box">
          <h4 className="alert-title">⚠️ Flagged for Administrative Pricing Review:</h4>
          <ul className="suspicious-list">
            {suspiciousTankers.map(t => (
              <li key={t.tankerId} className="suspicious-item">
                <strong>{t.displayName}</strong> ({t.tankerId}) &mdash; Rate: 
                <span className="price-tag-anomalous">₹{t.pricePer1000Litres} / 1000L</span>.
                Reason: {t.pricePer1000Litres < 150 ? 'Unusually low rate (potential data entry error)' : 'Rate significantly exceeds regional ceiling'}.
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="normal-pricing-banner">
          ✓ All registered tanker rate cards are within acceptable regional parameters (₹150 - ₹2,000 per 1,000L).
        </div>
      )}

      <div className="pricing-rules-note">
        <strong>Anti-Gouging Governance Policy:</strong>
        <p>
          WaterSaathi operates transparent fixed-quote calculation on the backend. When households coordinate demand via pooling, delivery efficiency discounts are transparently computed per household rather than opaque surge multipliers.
        </p>
      </div>
    </div>
  );
}
