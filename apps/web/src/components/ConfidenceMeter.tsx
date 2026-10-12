'use client';

import React from 'react';

interface ConfidenceMeterProps {
  estimate: number; // 0.0 to 1.0
  uncertainty: number; // e.g. 0.15
  label?: string;
  showDetails?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  estimate,
  uncertainty,
  label,
  showDetails = true,
}) => {
  const percentage = Math.round(estimate * 100);
  const uncertaintyWidth = Math.min(100, Math.round(uncertainty * 100 * 2)); // 95% CI roughly 2*sigma

  // Color selection based on demonstrated capability
  let barColor = 'var(--accent)';
  if (estimate >= 0.7 && uncertainty <= 0.2) {
    barColor = 'var(--success)';
  } else if (estimate < 0.45) {
    barColor = 'var(--danger)';
  } else {
    barColor = 'var(--warning)';
  }

  const uncertaintyBand =
    uncertainty <= 0.15 ? 'High confidence' : uncertainty <= 0.25 ? 'Moderate confidence' : 'High uncertainty';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', minWidth: '140px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px' }}>
        {label && <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>{label}</span>}
        <span style={{ color: 'var(--ink-strong)', fontWeight: 600, fontFamily: 'monospace' }}>
          {percentage}% <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>±{Math.round(uncertainty * 100)}%</span>
        </span>
      </div>

      {/* Accessible progress meter bar */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Competency Estimate'}
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: '3px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: barColor,
            borderRadius: '3px',
            transition: 'width 200ms ease',
          }}
        />
      </div>

      {showDetails && (
        <div style={{ fontSize: '11px', color: 'var(--ink-soft)', textAlign: 'right' }}>
          {uncertaintyBand}
        </div>
      )}
    </div>
  );
};
