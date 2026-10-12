'use client';

import React, { useState } from 'react';
import { Quote, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface TickerQuote {
  id: string;
  speaker: string;
  competency: string;
  quote: string;
  bloom: string;
  timestamp: string;
}

const STREAMING_QUOTES: TickerQuote[] = [
  {
    id: 'EVID-901',
    speaker: 'Aasish',
    competency: 'Kubernetes Autoscaling',
    quote: 'Our HPA scaled pods based on custom p99 message lag metrics from Prometheus rather than default CPU thresholds.',
    bloom: 'L4 Analysis',
    timestamp: '03:14',
  },
  {
    id: 'EVID-902',
    speaker: 'Aasish',
    competency: 'Go Concurrency',
    quote: 'We implemented buffered channel pools with context timeouts to prevent goroutine memory leaks under backpressure.',
    bloom: 'L4 Analysis',
    timestamp: '05:42',
  },
  {
    id: 'EVID-903',
    speaker: 'Taylor Reed',
    competency: 'Raft Consensus',
    quote: 'During cluster leader partitions, we forced write quorums through lease read semantics to avoid split-brain states.',
    bloom: 'L5 Evaluation',
    timestamp: '08:19',
  },
  {
    id: 'EVID-904',
    speaker: 'Morgan Vance',
    competency: 'Zero-Trust mTLS',
    quote: 'SPIFFE workload IDs were cryptographically validated at every Envoy sidecar proxy hop with 4-hour cert rotations.',
    bloom: 'L5 Evaluation',
    timestamp: '11:05',
  },
];

export const EvidenceTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<TickerQuote | null>(null);

  return (
    <div
      style={{
        width: '100%',
        margin: 'var(--space-4) 0',
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ticker Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          backgroundColor: 'rgba(5, 150, 105, 0.10)',
          border: '1px solid rgba(5, 150, 105, 0.25)',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--success)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            boxShadow: '0 0 6px rgba(5, 150, 105, 0.8)',
          }}
        />
        <span>VERIFIED QUOTES STREAM</span>
      </div>

      {/* Marquee Body */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '24px',
            animation: isPaused ? 'none' : 'marqueeSlide 38s linear infinite',
          }}
        >
          {STREAMING_QUOTES.concat(STREAMING_QUOTES).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => setSelectedQuote(item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--ink)',
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(248, 250, 252, 0.7)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 120ms ease',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--accent)',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                [{item.id}]
              </span>
              <span style={{ fontWeight: 600, color: 'var(--ink-strong)' }}>{item.competency}:</span>
              <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                &ldquo;{item.quote}&rdquo;
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--success)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <CheckCircle2 size={11} /> {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/recruiter/reports"
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--accent)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span>View Dossier</span>
        <ArrowRight size={12} />
      </Link>

      <style jsx global>{`
        @keyframes marqueeSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
