'use client';

import React from 'react';
import { Quote } from 'lucide-react';

interface EvidenceChipProps {
  evidenceId: string;
  label?: string;
  onClick: (evidenceId: string) => void;
  variant?: 'subtle' | 'outline' | 'compact';
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({
  evidenceId,
  label,
  onClick,
  variant = 'subtle',
}) => {
  const displayLabel = label || `Proof [${evidenceId}]`;

  return (
    <button
      type="button"
      onClick={() => onClick(evidenceId)}
      aria-label={`Open verified transcript evidence for ${displayLabel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: variant === 'compact' ? '2px 6px' : '3px 8px',
        backgroundColor: variant === 'outline' ? 'transparent' : 'var(--accent-soft)',
        color: 'var(--accent-hover)',
        border: variant === 'outline' ? '1px solid var(--border-strong)' : '1px solid transparent',
        borderRadius: 'var(--radius-sm)',
        fontSize: variant === 'compact' ? '11px' : '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 120ms ease',
        fontFamily: 'monospace',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--surface)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          variant === 'outline' ? 'transparent' : 'var(--accent-soft)';
        e.currentTarget.style.color = 'var(--accent-hover)';
      }}
    >
      <Quote size={11} style={{ transform: 'rotate(180deg)' }} />
      <span>{displayLabel}</span>
    </button>
  );
};
