'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Sliders,
  Volume2,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  Sparkles,
  RefreshCw,
  Bell,
  Check,
  Server,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'compliance' | 'voice' | 'accessibility'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || 'Sarah Chen');
  const [email, setEmail] = useState(user?.email || 'sarah.recruiter@provenance.ai');
  const [orgName, setOrgName] = useState(user?.organization_name || 'Provenance Enterprise Corp');
  const [department, setDepartment] = useState(user?.department || 'Platform Architecture & Distributed Systems');
  const [role, setRole] = useState(user?.role || 'recruiter');

  // AI Engine Calibration settings
  const [startingBloom, setStartingBloom] = useState(4);
  const [minTurns, setMinTurns] = useState(3);
  const [maxTurns, setMaxTurns] = useState(6);
  const [uncertaintyThreshold, setUncertaintyThreshold] = useState(0.15);
  const [evaluatorStrictness, setEvaluatorStrictness] = useState('balanced');
  const [adaptiveDrilldown, setAdaptiveDrilldown] = useState(true);

  // Compliance & Privacy settings
  const [retentionDays, setRetentionDays] = useState(90);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [presenceSensitivity, setPresenceSensitivity] = useState('normal');
  const [auditWebhookUrl, setAuditWebhookUrl] = useState('https://api.provenance.ai/v1/compliance/merkle-broadcast');

  // Voice & Interaction settings
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [autoReadQuestion, setAutoReadQuestion] = useState(true);
  const [noiseFilter, setNoiseFilter] = useState(true);

  // Accessibility & Display settings
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [captionsDefault, setCaptionsDefault] = useState(true);

  // Feedback states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  // Fetch live settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${apiUrl}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.org_name) setOrgName(data.org_name);
          if (data.primary_department) setDepartment(data.primary_department);

          if (data.ai_engine) {
            setStartingBloom(data.ai_engine.starting_bloom_level ?? 4);
            setMinTurns(data.ai_engine.min_turns ?? 3);
            setMaxTurns(data.ai_engine.max_turns ?? 6);
            setUncertaintyThreshold(data.ai_engine.uncertainty_threshold ?? 0.15);
            setEvaluatorStrictness(data.ai_engine.evaluator_strictness ?? 'balanced');
            setAdaptiveDrilldown(data.ai_engine.adaptive_drilldown_enabled ?? true);
          }

          if (data.compliance) {
            setRetentionDays(data.compliance.bipa_retention_days ?? 90);
            setPiiRedaction(data.compliance.pii_redaction_mode ?? true);
            setPresenceSensitivity(data.compliance.presence_sensitivity ?? 'normal');
            if (data.compliance.audit_webhook_url) setAuditWebhookUrl(data.compliance.audit_webhook_url);
          }

          if (data.voice_audio) {
            setTtsSpeed(data.voice_audio.tts_playback_speed ?? 1.0);
            setTtsPitch(data.voice_audio.tts_pitch ?? 1.0);
            setAutoReadQuestion(data.voice_audio.auto_read_question ?? true);
            setNoiseFilter(data.voice_audio.ambient_noise_filter ?? true);
          }

          if (data.accessibility) {
            setHighContrast(data.accessibility.high_contrast_mode ?? false);
            setReducedMotion(data.accessibility.prefers_reduced_motion ?? false);
            setCaptionsDefault(data.accessibility.show_captions_default ?? true);
          }
        }
      } catch (_) {}
    }
    loadSettings();
  }, [apiUrl]);

  // Sync user state when user changes
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.role) setRole(user.role);
      if (user.organization_name) setOrgName(user.organization_name);
      if (user.department) setDepartment(user.department);
    }
  }, [user]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setStatusMsg('');

    const payload = {
      org_name: orgName,
      primary_department: department,
      ai_engine: {
        starting_bloom_level: Number(startingBloom),
        min_turns: Number(minTurns),
        max_turns: Number(maxTurns),
        uncertainty_threshold: Number(uncertaintyThreshold),
        evaluator_strictness: evaluatorStrictness,
        adaptive_drilldown_enabled: adaptiveDrilldown,
      },
      compliance: {
        bipa_retention_days: Number(retentionDays),
        pii_redaction_mode: piiRedaction,
        presence_sensitivity: presenceSensitivity,
        audit_webhook_url: auditWebhookUrl,
        zero_biometrics_enforced: true,
      },
      voice_audio: {
        tts_playback_speed: Number(ttsSpeed),
        tts_pitch: Number(ttsPitch),
        auto_read_question: autoReadQuestion,
        ambient_noise_filter: noiseFilter,
      },
      accessibility: {
        high_contrast_mode: highContrast,
        prefers_reduced_motion: reducedMotion,
        show_captions_default: captionsDefault,
      },
    };

    try {
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        updateUser({
          name,
          email,
          organization_name: orgName,
          department,
          role,
        });
        setSaveSuccess(true);
        setStatusMsg('Settings successfully persisted to database & recorded in audit log.');
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setStatusMsg('Failed to save settings to backend server.');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error connecting to settings API.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Organization', icon: <User size={16} /> },
    { id: 'ai', label: 'AI Calibration', icon: <Sliders size={16} /> },
    { id: 'compliance', label: 'Compliance & BIPA', icon: <Shield size={16} /> },
    { id: 'voice', label: 'Audio & Speech', icon: <Volume2 size={16} /> },
    { id: 'accessibility', label: 'Display & Access', icon: <Eye size={16} /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Platform & Intelligence Settings"
        description="Configure tenant credentials, adaptive questioning parameters, BIPA compliance rules, and interaction preferences."
        primaryAction={{
          label: saving ? 'Saving...' : 'Save All Settings',
          onClick: () => handleSaveSettings(),
          icon: saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />,
        }}
      />

      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Success Banner */}
        {saveSuccess && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--success-soft)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--success)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{statusMsg}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ink-soft)', fontFamily: 'monospace' }}>
              Timestamp: {new Date().toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Tab Navigation Strip */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '2px',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className="btn-tactile"
                style={{
                  padding: '10px 18px',
                  backgroundColor: active ? 'var(--surface)' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? 'var(--border)' : 'transparent',
                  borderBottom: active ? '2px solid var(--accent)' : 'none',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: active ? 'var(--accent)' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSaveSettings}>
          {/* TAB 1: Profile & Organization */}
          {activeTab === 'profile' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink-strong)' }}>
                  User Profile & Organization Workspace
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
                  Manage your display name, corporate email, role permissions, and active hiring department.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Organization Title
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Primary Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                  Assigned Platform Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    maxWidth: '320px',
                    width: '100%',
                    padding: '9px 12px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--ink-strong)',
                  }}
                >
                  <option value="recruiter">Technical Recruiter (Full Management)</option>
                  <option value="hiring_manager">Hiring Manager (Read & Evaluation)</option>
                  <option value="auditor">Compliance & Bias Auditor (Audit Logs Only)</option>
                  <option value="admin">Platform Administrator (Unrestricted)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: AI & Adaptive Calibration */}
          {activeTab === 'ai' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink-strong)' }}>
                  Adaptive Assessment Engine Calibration
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
                  Adjust Bloom Taxonomy difficulty progression, turn limits, and Bayesian stopping conditions.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      Starting Bloom Ladder Level: <strong>L{startingBloom}</strong>
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                      {startingBloom === 1 ? 'Remember' : startingBloom === 2 ? 'Understand' : startingBloom === 3 ? 'Apply' : startingBloom === 4 ? 'Analyze' : startingBloom === 5 ? 'Evaluate' : 'Create'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={startingBloom}
                    onChange={(e) => setStartingBloom(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)' }}>
                    <span>L1 (Foundation)</span>
                    <span>L4 (Architectural)</span>
                    <span>L6 (Synthesis)</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      Minimum Required Turns: <strong>{minTurns} turns</strong>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={minTurns}
                    onChange={(e) => setMinTurns(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    Guarantees sufficient evidence is gathered before candidate can early-conclude.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Evaluator Rubric Strictness
                  </label>
                  <select
                    value={evaluatorStrictness}
                    onChange={(e) => setEvaluatorStrictness(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  >
                    <option value="strict">Strict (Requires exact numerical metrics & RFC citations)</option>
                    <option value="balanced">Balanced (Standard enterprise engineering rubric)</option>
                    <option value="permissive">Permissive (Gives partial credit for conceptual grasp)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Bayesian Uncertainty Threshold (&sigma;)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="0.30"
                    value={uncertaintyThreshold}
                    onChange={(e) => setUncertaintyThreshold(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  id="adaptive-drilldown"
                  checked={adaptiveDrilldown}
                  onChange={(e) => setAdaptiveDrilldown(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="adaptive-drilldown" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                  Enable Adaptive Drilldown Question Probing (Generates targeted follow-ups when criteria are missed)
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Compliance & Privacy (BIPA / EU AI Act) */}
          {activeTab === 'compliance' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink-strong)' }}>
                  Statutory AI Compliance & Data Governance
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
                  Controls Illinois BIPA data retention, EEOC bias guards, and cryptographic Merkle tree auditing.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    Data Retention Limit (BIPA Compliance)
                  </label>
                  <select
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  >
                    <option value="30">30 Days (Maximum privacy standard)</option>
                    <option value="90">90 Days (Enterprise recommended)</option>
                    <option value="180">180 Days (Standard recruiting season)</option>
                    <option value="365">365 Days (Full annual compliance cycle)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    On-Device Face Presence Sensitivity
                  </label>
                  <select
                    value={presenceSensitivity}
                    onChange={(e) => setPresenceSensitivity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: 'var(--ink-strong)',
                    }}
                  >
                    <option value="low">Low (Tolerates frequent camera angles)</option>
                    <option value="normal">Normal (Standard on-device counter)</option>
                    <option value="high">High (Immediate presence debouncing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                  Cryptographic Merkle Audit Webhook URL
                </label>
                <input
                  type="url"
                  value={auditWebhookUrl}
                  onChange={(e) => setAuditWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--ink-strong)',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                  Receives automated tamper-evident SHA-256 Merkle root notifications on interview finalization.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="pii-redaction"
                    checked={piiRedaction}
                    onChange={(e) => setPiiRedaction(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="pii-redaction" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                    Candidate PII Redaction Mode (Anonymizes candidate phone, address, and name before LLM evaluation)
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500,
                  }}
                >
                  <Shield size={16} />
                  <span>
                    <strong>Statutory Invariant:</strong> Provenance strictly does NOT recognize facial emotion, store raw video, or output cheating probabilities.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Audio & Speech Interaction */}
          {activeTab === 'voice' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink-strong)' }}>
                  Speech Synthesis & Voice Orb Configuration
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
                  Calibrate AI voice delivery speed, natural inflection pitch, and automatic speech triggers.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      TTS Voice Speed: <strong>{ttsSpeed}x</strong>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)' }}>
                    <span>0.8x (Deliberate)</span>
                    <span>1.0x (Standard)</span>
                    <span>1.4x (Brisk)</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      TTS Inflection Pitch: <strong>{ttsPitch}x</strong>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)' }}>
                    <span>Deep</span>
                    <span>Natural</span>
                    <span>Bright</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="auto-read"
                    checked={autoReadQuestion}
                    onChange={(e) => setAutoReadQuestion(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="auto-read" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                    Auto-Read Questions Out Loud (Synthesizes question audio immediately upon turn advancement)
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="noise-filter"
                    checked={noiseFilter}
                    onChange={(e) => setNoiseFilter(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="noise-filter" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                    Ambient Noise Cancellation & Echo Suppression Filter
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Display & Accessibility */}
          {activeTab === 'accessibility' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink-strong)' }}>
                  Display, Contrast & WCAG 2.2 AA Accessibility
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
                  Customize executive theme tokens, visual contrast, and motion sensitivity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                      High-Contrast Executive Mode
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Enhances text contrast ratios to exceed WCAG 2.2 AAA standards (7:1+ ratio).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                      Reduced Motion Preference
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Silences gyroscope animations, 3D voice orb pulsations, and fluid transitions.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                      Real-Time Closed Captions Default
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Always displays speech-to-text transcript subtitles during candidate and AI speaking turns.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={captionsDefault}
                    onChange={(e) => setCaptionsDefault(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
            }}
          >
            <button
              type="submit"
              disabled={saving}
              className="btn-tactile"
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving to Database...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
