'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ProvenanceLogo } from '@/components/ProvenanceLogo';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('recruiter');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please complete all required fields (Name, Email, and Password).');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await signup({
      name,
      email,
      password,
      organization_name: organization || 'Provenance Enterprise Corp',
      role,
      department: 'Technology & Engineering',
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created & persisted in database! Redirecting to workspace...');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } else {
      setErrorMsg(res.error || 'Registration failed. An account with this email may already exist.');
    }
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
      {/* Background Decorative Rings */}
      <div
        style={{
          position: 'absolute',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
          top: '-160px',
          left: '-120px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
          bottom: '-140px',
          right: '-120px',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-popover)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
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
            Create Your Account
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
            Open to everyone — instant database registration with custom role & organization
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

        {/* Signup Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label
              htmlFor="signup-name"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
            >
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aasish Vignan"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--ink-strong)',
                  outline: 'none',
                }}
              />
              <User
                size={16}
                color="var(--ink-soft)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
            >
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--ink-strong)',
                  outline: 'none',
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
            <label
              htmlFor="signup-password"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
            >
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  color: 'var(--ink-strong)',
                  outline: 'none',
                }}
              />
              <Lock
                size={16}
                color="var(--ink-soft)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label
                htmlFor="signup-org"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
              >
                Organization
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 32px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--ink-strong)',
                    outline: 'none',
                  }}
                />
                <Building2
                  size={15}
                  color="var(--ink-soft)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-role"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
              >
                Primary Role
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="signup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 32px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--ink-strong)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="recruiter">Recruiter / Talent Ops</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="auditor">Compliance Auditor</option>
                  <option value="admin">Platform Administrator</option>
                </select>
                <Briefcase
                  size={15}
                  color="var(--ink-soft)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
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
              marginTop: '6px',
            }}
          >
            {loading ? (
              <span>Persisting Account to Database...</span>
            ) : (
              <>
                <span>Create Account & Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Compliance Trust Seal */}
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
        <span>Live SQLite Persistence · Immutable Audit Trail · PBKDF2 Password Protection</span>
      </div>
    </div>
  );
}
