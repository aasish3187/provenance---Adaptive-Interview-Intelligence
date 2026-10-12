'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Building2,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ProvenanceLogo } from '@/components/ProvenanceLogo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication verified. Redirecting to workspace...');
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      setErrorMsg(res.error || 'Invalid email or password.');
    }
  };

  const handleQuickDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Glow Rings */}
      <div
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
          top: '-150px',
          right: '-100px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          bottom: '-120px',
          left: '-100px',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-popover)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          zIndex: 1,
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 'var(--space-3)' }}>
            <ProvenanceLogo size={42} wordmarkSize={20} />
          </Link>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--ink-strong)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            Sign In to Provenance
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
            Enter your credentials to access your organization workspace
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-soft)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--success-soft)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--ink-strong)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
              <Mail
                size={16}
                color="var(--ink-soft)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor="login-password"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--ink-strong)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
              <Lock
                size={16}
                color="var(--ink-soft)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Profiles */}
        <div
          style={{
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: 'var(--ink-muted)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Zap size={12} color="var(--accent)" /> Quick Demo Credentials (1-Click Fill)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('sarah@acme.corp', 'superpassword123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--ink)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong>Sarah Recruiter</strong> <span style={{ color: 'var(--ink-soft)' }}>(sarah@acme.corp)</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>Fill</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('marcus.audit@provenance.ai', 'auditPass2026')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--ink)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <strong>Marcus Auditor</strong> <span style={{ color: 'var(--ink-soft)' }}>(Compliance Officer)</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>Fill</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Signup */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink-muted)' }}>
          Don't have an account yet?{' '}
          <Link
            href="/auth/signup"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign up free
          </Link>
        </div>
      </div>

      {/* Compliance Trust Badge */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--ink-soft)',
        }}
      >
        <ShieldCheck size={14} color="var(--success)" />
        <span>EU AI Act Article 14 Audited · Cryptographic PBKDF2 Hashing · Tenant-Isolated Org Workspaces</span>
      </div>
    </div>
  );
}
