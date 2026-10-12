'use client';

import React, { useState } from 'react';
import { FileText, Mic, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';

interface DiffPair {
  id: string;
  claim: string;
  resumeSnippet: string;
  transcriptQuote: string;
  status: 'Verified' | 'Growth Gap' | 'Hidden Gem';
  confidence: number;
}

const DIFF_PAIRS: DiffPair[] = [
  {
    id: 'PAIR-1',
    claim: 'Kubernetes Pod Autoscaling',
    resumeSnippet: 'Architected autoscaling policies for 500+ microservices on AWS EKS using horizontal pod autoscalers.',
    transcriptQuote: '“Our HPA scaled pods based on custom p99 message lag metrics from Prometheus rather than default CPU thresholds.”',
    status: 'Verified',
    confidence: 92,
  },
  {
    id: 'PAIR-2',
    claim: 'Go High-Throughput Concurrency',
    resumeSnippet: 'Engineered high-throughput streaming pipelines in Go handling 100k events/sec with zero thread deadlocks.',
    transcriptQuote: '“We implemented buffered channel pools with context timeouts to prevent goroutine memory leaks under backpressure.”',
    status: 'Verified',
    confidence: 88,
  },
  {
    id: 'PAIR-3',
    claim: 'Zero-Trust SPIFFE & mTLS',
    resumeSnippet: 'Led zero-trust migration establishing mutual TLS across inter-service RPC mesh with SPIFFE workload attestation.',
    transcriptQuote: '“We configured basic Envoy ingress proxies, but had to defer SPIRE agent attestation due to legacy kernel limitations.”',
    status: 'Growth Gap',
    confidence: 42,
  },
];

export const ResumeTranscriptDiff: React.FC = () => {
  const { playCrystalSound } = useScenario();
  const [selectedPair, setSelectedPair] = useState<DiffPair>(DIFF_PAIRS[0]);

  return (
    <div
      className="glass-card-pro"
      style={{
        padding: '20px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        marginTop: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              Resume Claim vs. Spoken Reality Interactive Diff
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)' }}>
              Verifies if paper claims hold up under adaptive technical probe
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {DIFF_PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => {
                setSelectedPair(pair);
                playCrystalSound('click');
              }}
              className="btn-tactile"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: selectedPair.id === pair.id ? 700 : 500,
                backgroundColor: selectedPair.id === pair.id ? 'rgba(79, 70, 229, 0.1)' : 'rgba(241, 245, 249, 0.8)',
                color: selectedPair.id === pair.id ? 'var(--accent)' : 'var(--ink-muted)',
                border: selectedPair.id === pair.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {pair.claim}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Dual View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
        {/* Left: Resume Claim */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(248, 250, 252, 0.85)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)' }}>
            <FileText size={14} />
            <span>RESUME CLAIM (PAPER)</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--ink)' }}>
            {selectedPair.resumeSnippet}
          </p>
        </div>

        {/* Center: Connector Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: selectedPair.status === 'Verified' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(225, 29, 72, 0.12)',
              color: selectedPair.status === 'Verified' ? '#059669' : '#E11D48',
              border: `1px solid ${selectedPair.status === 'Verified' ? '#059669' : '#E11D48'}`,
            }}
          >
            {selectedPair.status === 'Verified' ? '✓ VERIFIED' : '⚠ GAP FLAGGED'}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
            {selectedPair.confidence}% match
          </span>
        </div>

        {/* Right: Spoken Reality */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(240, 253, 244, 0.65)',
            border: '1px solid rgba(187, 247, 208, 0.9)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>
            <Mic size={14} />
            <span>SPOKEN TRANSCRIPT (AUDIO REALITY)</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--ink)', fontStyle: 'italic' }}>
            {selectedPair.transcriptQuote}
          </p>
        </div>
      </div>
    </div>
  );
};
