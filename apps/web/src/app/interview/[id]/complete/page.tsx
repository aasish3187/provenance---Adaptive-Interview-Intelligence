'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, FileText, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';

export default function InterviewCompletePage() {
  const params = useParams();
  const interviewId = (params?.id as string) || 'INT-901';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent)',
              color: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            P
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-strong)' }}>
            provenance
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Workspace</span>
        </Link>
      </div>

      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-soft)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={36} />
        </div>

        <div>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--ink-muted)',
              backgroundColor: 'var(--surface-subtle)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Session ID: {interviewId}
          </span>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--ink-strong)',
              letterSpacing: '-0.02em',
              margin: 'var(--space-2) 0 0 0',
            }}
          >
            Interview Completed & Verified
          </h1>
        </div>

        <p style={{ fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>
          Your spoken answers, technical explanations, and behavioral evidence spans have been
          analyzed and committed into the cryptographic evidence ledger.
        </p>

        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--ink)',
            textAlign: 'left',
            lineHeight: 1.5,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              marginBottom: '4px',
              color: 'var(--accent)',
            }}
          >
            <ShieldCheck size={16} /> 100% Evidence-Backed Guarantee:
          </div>
          Every score and feedback point in your readiness report is linked to exact verbatim quotes from your session. No black-box decisions, no speculative scores.
        </div>

        <div
          style={{
            marginTop: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            width: '100%',
          }}
        >
          {/* Primary CTA: View Dynamic Report */}
          <Link
            href={`/interview/${interviewId}/report`}
            id="view-readiness-report-btn"
            style={{
              padding: 'var(--space-4) var(--space-6)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <FileText size={18} />
            <span>View My Complete Readiness Report</span>
            <ArrowRight size={18} />
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Link
              href="/interview/start"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <RefreshCw size={14} /> Practice Another Role
            </Link>

            <Link
              href={`/recruiter/interviews/${interviewId}`}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              Recruiter Dossier View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
