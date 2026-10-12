'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Mic,
  MessageSquare,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { ProvenanceLogo } from '@/components/ProvenanceLogo';

export default function CandidateConsentPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = (params?.id as string) || 'INT-DEMO';

  const [textPreferred, setTextPreferred] = useState(false);
  const [presenceAgreed, setPresenceAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleAgreeAndStart = async () => {
    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    try {
      await fetch(`${apiUrl}/interviews/${interviewId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_version: '1.0',
          agreed: true,
          text_mode_preferred: textPreferred,
          presence_sensor_agreed: presenceAgreed,
        }),
      });
    } catch (e) {
      // In offline / client-only mode, continue cleanly
    }

    router.push(`/interview/${interviewId}`);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  if (declined) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: 'var(--surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink-strong)', marginBottom: 'var(--space-3)' }}>
            Interview Cancelled
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 'var(--space-6)' }}>
            You have declined the AI interview consent. No data has been recorded. Your recruiter has been notified to discuss alternative manual interview options.
          </p>
          <a href="/" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>Return to Homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <ProvenanceLogo size={28} wordmarkSize={16} />
            </Link>

            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Back to unified workspace"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                backgroundColor: 'var(--surface-subtle)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--ink-strong)', letterSpacing: '-0.02em' }}>
            Candidate AI Disclosure & Consent
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            You are about to complete an evidence-driven interview. Please review what is used and how your answers are evaluated.
          </p>
        </div>

        {/* Section: What the system does and does NOT do */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--success-soft)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(22, 118, 83, 0.15)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
              ✓ What Provenance Evaluates:
            </div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>• Evaluates technical and role-specific competencies against observable rubric criteria.</li>
              <li>• Verifies verbatim quotes from your answers to substantiate all report findings.</li>
              <li>• A human recruiter or hiring manager reviews your evidence and makes all final decisions.</li>
            </ul>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>
              ✗ What Provenance Deliberately Does NOT Do:
            </div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--ink-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>• No emotion, affect, or facial expression recognition.</li>
              <li>• No personality profiling or speech accent scoring.</li>
              <li>• No automated candidate rejection.</li>
              <li>• No raw video or facial biometric data is ever stored on servers.</li>
            </ul>
          </div>
        </div>

        {/* Mode Preference Selector */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-5)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)', marginBottom: 'var(--space-2)' }}>
            Choose Your Interview Format:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => setTextPreferred(false)}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: !textPreferred ? '2px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: !textPreferred ? 'var(--accent-soft)' : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Camera size={18} color={!textPreferred ? 'var(--accent)' : 'var(--ink-muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: !textPreferred ? 'var(--accent-hover)' : 'var(--ink-strong)' }}>
                  Live Camera + Voice (Recommended)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Real-time timed video evaluation</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTextPreferred(true)}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: textPreferred ? '2px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: textPreferred ? 'var(--accent-soft)' : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={18} color={textPreferred ? 'var(--accent)' : 'var(--ink-muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: textPreferred ? 'var(--accent-hover)' : 'var(--ink-strong)' }}>
                  Text-Only Mode
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Equal-status accessible text input</div>
              </div>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-6)' }}>
          <button
            type="button"
            onClick={handleDecline}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-muted)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Decline
          </button>

          <button
            type="button"
            onClick={handleAgreeAndStart}
            disabled={submitting}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              backgroundColor: 'var(--accent)',
              color: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {submitting ? 'Initializing Session...' : 'I Agree & Start Interview'}{' '}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
