'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Check, Target, Compass } from 'lucide-react';

export interface WhyCardData {
  targetSkill: string;
  reason: string;
  questionType: 'probe' | 'drill' | 'elevate' | 'verify' | 'bridge';
  bloomLevel?: number;
  evaluationCriteria: string[];
  alternativeConsidered?: string;
}

interface WhyCardProps {
  data: WhyCardData;
}

export const WhyCard: React.FC<WhyCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const modeBadgeColor: Record<string, { bg: string; color: string }> = {
    probe: { bg: 'var(--info-soft)', color: 'var(--info)' },
    drill: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
    elevate: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
    verify: { bg: 'var(--success-soft)', color: 'var(--success)' },
    bridge: { bg: 'var(--surface-subtle)', color: 'var(--ink-muted)' },
  };

  const badge = modeBadgeColor[data.questionType] || { bg: 'var(--surface-subtle)', color: 'var(--ink-muted)' };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Target size={16} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-strong)' }}>
            Why This Question
          </span>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {data.questionType} mode {data.bloomLevel && `· L${data.bloomLevel}`}
        </span>
      </div>

      {/* Target Competency */}
      <div>
        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '2px' }}>Target Competency</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
          {data.targetSkill}
        </div>
      </div>

      {/* Trigger & Plain English Reason */}
      <div
        style={{
          padding: 'var(--space-3)',
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: 'var(--ink)',
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--ink-strong)' }}>Trigger: </span>
        {data.reason}
      </div>

      {/* Rubric Criteria Checklist */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
          Observable Criteria Evaluated
        </div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.evaluationCriteria.map((criterion, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                fontSize: '13px',
                color: 'var(--ink)',
              }}
            >
              <Check size={14} color="var(--accent)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Optional Alternative Considered toggle */}
      {data.alternativeConsidered && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontSize: '12px',
              color: 'var(--ink-muted)',
              padding: 0,
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{expanded ? 'Hide alternative considered' : 'View alternative considered'}</span>
          </button>

          {expanded && (
            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                borderLeft: '2px solid var(--border-strong)',
                fontSize: '12px',
                color: 'var(--ink-muted)',
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              }}
            >
              {data.alternativeConsidered}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
