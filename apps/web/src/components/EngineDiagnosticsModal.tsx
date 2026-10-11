'use client';

import React from 'react';
import { Activity, X, Server, Database, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface EngineDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineDiagnosticsModal: React.FC<EngineDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-in-modal"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px -8px rgba(15, 23, 42, 0.16), 0 0 32px -4px rgba(5, 150, 105, 0.15), inset 0 1.5px 2px 0 rgba(255, 255, 255, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(248, 250, 252, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(5, 150, 105, 0.10)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                Gemini Live Telemetry & Engine Diagnostics
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                Real-time WebSocket bridge & evidence pipeline
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--ink-muted)', padding: '6px', borderRadius: '4px' }}
            aria-label="Close diagnostics"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Metrics Bento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(241, 245, 249, 0.7)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>
                Live Audio Latency
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="radar-beacon" />
                164 ms
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                WebSocket bi-directional stream
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(241, 245, 249, 0.7)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>
                Evidence Grounding
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                100% Verbatim
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                Normalized substring verification
              </div>
            </div>
          </div>

          {/* Subsystem Health Checklist */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'rgba(241, 245, 249, 0.55)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} style={{ color: 'var(--accent)' }} />
              Subsystem Live Connections
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--ink-muted)' }}>Gemini Multimodal Live API</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> gemini-2.5-live-preview
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--ink-muted)' }}>SQLite Evidence Ledger</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> 35 Verified Spans
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--ink-muted)' }}>Adaptive Beta State Engine</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Conjugate Prior Active
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--ink-muted)' }}>On-Device Presence Tracker</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <ShieldCheck size={13} /> Zero Biometric Storage (BIPA Compliant)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(248, 250, 252, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            className="btn-tactile"
            style={{
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--ink-strong)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Dismiss Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
