'use client';

import React, { useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  BookmarkCheck,
  FileText,
} from 'lucide-react';
import { DemoEvidence } from '../fixtures/demoData';
import { ConfidenceMeter } from './ConfidenceMeter';

interface ProoflineDrawerProps {
  evidence: DemoEvidence | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkForReview?: (evidenceId: string) => void;
}

export const ProoflineDrawer: React.FC<ProoflineDrawerProps> = ({
  evidence,
  isOpen,
  onClose,
  onMarkForReview,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [marked, setMarked] = React.useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evidence) return null;

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${evidence.candidateQuote}" — ${evidence.speaker} (${evidence.timestamp})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkReview = () => {
    setMarked(true);
    if (onMarkForReview) onMarkForReview(evidence.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proofline-drawer-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 25, 43, 0.35)',
          backdropFilter: 'blur(2px)',
          transition: 'opacity 150ms ease',
        }}
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-popover)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'slideIn 200ms ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 6px',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {evidence.id}
            </span>
            <h2 id="proofline-drawer-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-strong)' }}>
              Verified Proofline Evidence
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence drawer"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Section 1: Finding & Target Competency */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '4px' }}>
              Target Competency
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-strong)' }}>
              {evidence.competencyName}
            </div>
          </div>

          {/* Section 2: Source Question & Verbatim Quote */}
          <div
            style={{
              backgroundColor: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '2px' }}>
                Question Asked (Turn {evidence.turnIndex})
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-strong)', lineHeight: 1.4 }}>
                {evidence.questionText}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                  Verbatim Candidate Quote
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--ink-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  <Clock size={12} /> {evidence.timestamp}
                </span>
              </div>

              <blockquote
                style={{
                  fontSize: '14px',
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  fontStyle: 'normal',
                  borderLeft: '3px solid var(--accent)',
                  paddingLeft: 'var(--space-3)',
                  margin: '4px 0',
                }}
              >
                &ldquo;{evidence.candidateQuote}&rdquo;
              </blockquote>

              <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px', fontWeight: 500 }}>
                ✓ Code-verified exact substring match against canonical transcript
              </div>
            </div>
          </div>

          {/* Section 3: Why it Counts (Rubric Criteria Met & Missed) */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-strong)', marginBottom: 'var(--space-2)' }}>
              Rubric Assessment Rationale
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
              {evidence.plainRationale}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {evidence.rubricCriteriaMet.map((met, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--success)' }}>
                  <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--ink)' }}>{met}</span>
                </div>
              ))}
              {evidence.rubricCriteriaMissed.map((missed, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--danger)' }}>
                  <XCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--ink-muted)' }}>{missed}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Estimate Movement Delta */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
              Competency Posterior Delta
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Prior Estimate</div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {Math.round(evidence.priorEstimate * 100)}%
                </div>
              </div>

              <ArrowRight size={18} color="var(--accent)" />

              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Updated Estimate</div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--success)' }}>
                  {Math.round(evidence.updatedEstimate * 100)}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Uncertainty (u)</div>
                <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
                  ±{Math.round(evidence.uncertainty * 100)}%
                </div>
              </div>
            </div>

            <ConfidenceMeter estimate={evidence.updatedEstimate} uncertainty={evidence.uncertainty} />

            <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '8px' }}>
              Note: Competency estimates are Bayesian posteriors (Beta distribution) reflecting verified capability, not an overall hiring score.
            </div>
          </div>

          {/* Section 5: Surrounding Context */}
          {(evidence.precedingQuote || evidence.followingQuote) && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '6px' }}>
                Transcript Neighborhood
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {evidence.precedingQuote && (
                  <div style={{ opacity: 0.7 }}>... {evidence.precedingQuote}</div>
                )}
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>[Turn {evidence.turnIndex} — Current Evidence]</div>
                {evidence.followingQuote && (
                  <div style={{ opacity: 0.7 }}>... {evidence.followingQuote}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <button
            type="button"
            onClick={handleCopyQuote}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Quote'}
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={handleMarkReview}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                backgroundColor: marked ? 'var(--warning-soft)' : 'var(--surface)',
                color: marked ? 'var(--warning)' : 'var(--ink)',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BookmarkCheck size={14} />
              {marked ? 'Flagged for HM' : 'Flag for HM'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--ink-strong)',
                color: 'var(--surface)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
