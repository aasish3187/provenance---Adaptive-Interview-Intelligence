'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Lock,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  Eye,
  GitBranch,
  ExternalLink,
} from 'lucide-react';

interface ProvenanceManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceManifestoModal: React.FC<ProvenanceManifestoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'pillars' | 'anatomy' | 'rules' | 'workflow'>('workflow');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card-pro"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 32px 80px -16px rgba(15, 23, 42, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px 20px 28px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Embedded Logo Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 55%, #0EA5E9 100%)',
                boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
                <rect x="11" y="22" width="7" height="11" rx="3.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.9" />
                <rect x="11" y="11" width="7" height="12" rx="3.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
                <path d="M17 11.5 H24 C28.8 11.5 32.5 15.2 32.5 20 C32.5 24.8 28.8 28.5 24 28.5 H17" stroke="#E0E7FF" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M18 16.5 C20.5 16.5 23 15.5 25.5 17.5 C27.5 19.2 27.5 22.5 24.5 23.5 C22.5 24.2 20 23.5 18 23.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeDasharray="1.5 2.5" />
                <circle cx="28.5" cy="14.5" r="1.8" fill="#10B981" />
                <circle cx="32.5" cy="20" r="1.7" fill="#38BDF8" />
                <circle cx="24" cy="28.5" r="1.6" fill="#F59E0B" />
                <circle cx="14.5" cy="17" r="1.5" fill="#FFFFFF" />
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink-strong)', letterSpacing: '-0.02em' }}>
                  The Provenance Brand & Philosophy
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  FOUNDATIONAL MANIFESTO
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--ink-muted)' }}>
                Evidence-driven, mathematically grounded, and anti-surveillance intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-tactile"
            aria-label="Close modal"
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(241, 245, 249, 0.8)',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '0 28px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid var(--border)',
            gap: '8px',
          }}
        >
          {[
            { id: 'workflow', label: '1. Workflow & 5 Modules' },
            { id: 'mission', label: '2. Why Provenance Exists' },
            { id: 'pillars', label: '3. The 5 Core Pillars' },
            { id: 'rules', label: '4. Non-Negotiable Rules' },
            { id: 'anatomy', label: '5. Logo Symbol Anatomy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 14px',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--ink-muted)',
                borderBottom: activeTab === tab.id ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* TAB 0: Workflow Architecture & The 5 Modules */}
          {activeTab === 'workflow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)',
                  border: '1px solid rgba(79, 70, 229, 0.18)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                    Google Student Club Hackathon — Track 03: Adaptive Interview Intelligence
                  </h3>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--accent)', color: '#fff', fontWeight: 700 }}>
                    5 OF 5 MODULES INTEGRATED
                  </span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  Provenance connects all 5 problem-statement modules into one continuous evidence loop. Scores, questions, and reports are strict analytical views over a single <strong>Append-Only Evidence Ledger</strong>.
                </p>
              </div>

              {/* Visual Workflow Diagram Preview Card */}
              <div
                style={{
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#0F172A',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#93C5FD' }}>
                    Full End-to-End System Workflow Map (High-Resolution)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href="/provenance_workflow_diagram.png"
                      download="provenance_workflow_diagram.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#38BDF8',
                        textDecoration: 'none',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Download PNG
                    </a>
                    <a
                      href="/provenance_workflow_diagram.jpg"
                      download="provenance_workflow_diagram.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#CBD5E1',
                        textDecoration: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Download JPG
                    </a>
                  </div>
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src="/provenance_workflow_diagram.png"
                    alt="Provenance End-to-End Architecture Workflow"
                    style={{ width: '100%', maxWidth: '700px', height: 'auto', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* 5 Modules Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Module 1 */}
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                        MODULE 01
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--ink-strong)' }}>
                        Question Generation & Interview Adaptation
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)' }}>NBQ Engine</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <strong>Mathematical Utility U(c):</strong> Targets competencies with highest uncertainty and unverified claims. Automatically drives the adaptive Bloom ladder (L1 Recall → L6 Evaluation) and synthesizes transparent WhyCards for every question.
                  </p>
                </div>

                {/* Module 2 */}
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                        MODULE 02
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--ink-strong)' }}>
                        Real-Time Candidate Evaluation & Quote Verification
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--success)' }}>100% Grounded</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <strong>Verbatim Substring Proof:</strong> Every score is anchored to an exact transcript quote via normalized substring search in Python (<code>quote_verifier.py</code>). Updates Bayesian Beta posteriors (α, β) to compute mean proficiency and calibrated uncertainty.
                  </p>
                </div>

                {/* Module 3 */}
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>
                        MODULE 03
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--ink-strong)' }}>
                        Interview Integrity Intelligence & Benign Explanations
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#B91C1C' }}>Zero Face Recognition</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <strong>Privacy Sovereign Telemetry:</strong> Evaluates browser focus/blur, paste speed, and on-device presence counts. Emits explainable Review Priorities (None/Low/Med/High) paired with benign alternatives (e.g. secondary notes). Never auto-rejects.
                  </p>
                </div>

                {/* Module 4 */}
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6', backgroundColor: '#F5F3FF', padding: '2px 6px', borderRadius: '4px' }}>
                        MODULE 04
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--ink-strong)' }}>
                        Resume-to-Interview Skill Gap Intelligence
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6D28D9' }}>4-Quadrant Matrix</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <strong>Resume Claims vs. Demonstration:</strong> Compares job criteria, resume bullets, and verified interview evidence into 4 definitive quadrants: Verified Strengths, Untested Claims, Hidden Gems, and Growth Gaps.
                  </p>
                </div>

                {/* Module 5 */}
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                        MODULE 05
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--ink-strong)' }}>
                        Candidate Decision Intelligence & Evidence Dossier
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)' }}>Click-to-Quote Proof</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    <strong>Clickable Citation Dossier:</strong> Synthesizes an executive hiring briefing where every sentence cites verified evidence IDs [EVID-XXXX]. Recruiters click any chip to hear the exact candidate audio recording and view the quote span.
                  </p>
                </div>
              </div>

              {/* Architecture Link Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  backgroundColor: 'rgba(79, 70, 229, 0.06)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--ink)' }}>
                  <strong>Detailed Architecture & Sequence Diagrams:</strong> View the full Mermaid diagrams and mathematical proofs in <code>docs/WORKFLOW_DIAGRAM.md</code>.
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>
                  ALL GATES VERIFIED
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Why Provenance Exists */}
          {activeTab === 'mission' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)',
                  border: '1px solid rgba(79, 70, 229, 0.18)',
                  borderRadius: '12px',
                }}
              >
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                  Definition: prov·e·nance (/ˈprɒv.ɪ.nəns/)
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  <em>Noun.</em> The place of origin or earliest known history of something; the chronological chain of custody providing documented proof of authenticity and uncorrupted ownership.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  The Broken Status Quo in Technical Hiring:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 700, fontSize: '13px' }}>
                      <AlertTriangle size={15} /> Resume Bluffing & Keywords
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>
                      Unverified bullet points on resumes look identical to true mastery, leading to wasted interview cycles and shallow technical verification.
                    </p>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 700, fontSize: '13px' }}>
                      <AlertTriangle size={15} /> Black-Box AI "Scores"
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>
                      Conventional AI interview tools output meaningless numbers like "84/100", pseudo-scientific "cheating probabilities", and biometric video surveillance that discriminate against candidates.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  The Provenance Counter-Philosophy:
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  Provenance was built to replace <strong>guesswork with verifiable evidence</strong>. We believe hiring decisions must be transparent, tamper-evident, and auditable by both candidate and recruiter. Every assessment must show what is proven, what is yet unmeasured, and cite exact verbatim evidence.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: The 5 Core Pillars */}
          {activeTab === 'pillars' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  number: '01',
                  title: 'Verbatim Quote Grounding',
                  icon: <CheckCircle2 size={18} color="var(--success)" />,
                  desc: 'Every competency score and assessment claim must link directly to an exact normalized substring match in the candidate transcript. If a claim cannot be verified in code, it is discarded.',
                },
                {
                  number: '02',
                  title: 'Bayesian Epistemic Uncertainty',
                  icon: <TrendingUp size={18} color="var(--accent)" />,
                  desc: 'Never output a single deterministic hire/no-hire score. We use Beta probability distributions (α, β) that update with each turn, showing hiring teams both our estimate and our honest uncertainty bounds.',
                },
                {
                  number: '03',
                  title: 'The 4-Quadrant Reality Matrix',
                  icon: <Layers size={18} color="#0EA5E9" />,
                  desc: 'We cross-reference claimed resume proficiencies against demonstrated transcript evidence to reveal Verified Strengths, Untested Claims, Hidden Gems, and Verified Gaps.',
                },
                {
                  number: '04',
                  title: 'Anti-Surveillance & Fairness Sovereignty',
                  icon: <ShieldCheck size={18} color="#10B981" />,
                  desc: 'Strictly zero emotion recognition, zero facial recognition, zero personality typing, and zero permanent raw video storage. Face presence runs on-device in the browser and emits presence counts only.',
                },
                {
                  number: '05',
                  title: 'Immutable Cryptographic Chain of Custody',
                  icon: <Lock size={18} color="#6366F1" />,
                  desc: 'Every interview turn, evaluation delta, and integrity event is cryptographically sealed into a SHA-256 Merkle tree ledger, ensuring full compliance with EU AI Act High-Risk AI regulations.',
                },
              ].map((p) => (
                <div
                  key={p.number}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--accent)',
                      fontFamily: 'monospace',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {p.number}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                      {p.icon}
                      <span>{p.title}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Logo Symbol Anatomy */}
          {activeTab === 'anatomy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 55%, #0EA5E9 100%)',
                    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                    <rect x="11" y="22" width="7" height="11" rx="3.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" opacity="0.9" />
                    <rect x="11" y="11" width="7" height="12" rx="3.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
                    <path d="M17 11.5 H24 C28.8 11.5 32.5 15.2 32.5 20 C32.5 24.8 28.8 28.5 24 28.5 H17" stroke="#E0E7FF" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M18 16.5 C20.5 16.5 23 15.5 25.5 17.5 C27.5 19.2 27.5 22.5 24.5 23.5 C22.5 24.2 20 23.5 18 23.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeDasharray="1.5 2.5" />
                    <circle cx="28.5" cy="14.5" r="1.8" fill="#10B981" />
                    <circle cx="32.5" cy="20" r="1.7" fill="#38BDF8" />
                    <circle cx="24" cy="28.5" r="1.6" fill="#F59E0B" />
                    <circle cx="14.5" cy="17" r="1.5" fill="#FFFFFF" />
                  </svg>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: 'var(--ink-strong)' }}>
                    The Provenance Mark: Geometric Meaning
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                    Every line and node in the mark corresponds to a mathematical or architectural invariant of the platform.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', marginBottom: '4px' }}>
                    🔗 The Interlocking Spine
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                    Represents the unbroken <strong>transcript chain of custody</strong>. Each turn links to the next, immutable and tamper-evident.
                  </p>
                </div>

                <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', marginBottom: '4px' }}>
                    📈 The Beta Probability Arc
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                    The curve of the 'P' maps the <strong>Bayesian Beta distribution</strong>, symbolizing calibrated epistemic confidence rather than black-box guesses.
                  </p>
                </div>

                <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', marginBottom: '4px' }}>
                    🎯 The 4 Reality Nodes
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                    The multi-colored micro-nodes represent the <strong>4 Quadrants of Candidate Reality</strong> (Verified Strengths, Untested Claims, Hidden Gems, Verified Gaps).
                  </p>
                </div>

                <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', marginBottom: '4px' }}>
                    🛡️ The Sovereign Squircle
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                    The rounded prism boundary represents the <strong>Privacy Sovereign Shield</strong>: zero biometric surveillance, EU AI Act compliance, and human dignity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Non-Negotiable Rules */}
          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                  Standing Architectural Invariants (Enforced in Code):
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  <li>Every score/claim must link to a verified quote span in the transcript (verified via normalized substring match in Python).</li>
                  <li>Integrity output is strictly a <em>review priority</em> with explanations and benign alternatives. Never output "cheating probability", never auto-reject.</li>
                  <li>No overall hire/no-hire score. Show competency profile with uncertainty bounds.</li>
                  <li>Candidate text is treated as untrusted data; wrapped in canonical delimiters and sanitized via the Guard agent.</li>
                  <li>Mathematical models (coverage, uncertainty, utility scoring, Beta updates) execute deterministically in code; LLMs write language only.</li>
                </ul>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
                    Audit Ready & EU AI Act Compliant
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    Meets Article 14 (Human Oversight) and Article 13 (Transparency) standards.
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--success)', fontWeight: 700 }}>
                  VERIFIED LEDGER ACTIVE
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border)',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent)" />
            <span>Provenance · Evidence-Driven Adaptive Interview Intelligence</span>
          </div>

          <button
            onClick={onClose}
            className="btn-tactile"
            style={{
              padding: '7px 20px',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
