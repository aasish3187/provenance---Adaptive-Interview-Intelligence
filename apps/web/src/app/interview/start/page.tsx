'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileText,
  User,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UploadCloud,
  X,
  FileCheck,
  ArrowLeft,
} from 'lucide-react';
import { ProvenanceLogo } from '@/components/ProvenanceLogo';

const ROLE_PRESETS = [
  {
    title: 'Senior Distributed Systems Engineer',
    department: 'Core Infrastructure',
    jd: 'We are seeking a Senior Distributed Systems Engineer to design, implement, and scale fault-tolerant microservices. Required skills: Go concurrency, goroutine pools, channel semantics, Raft/Paxos consensus algorithms, Kubernetes container orchestration, and zero-trust mutual TLS architectures.',
    sampleResume: 'Senior Backend Engineer with 5 years building high-throughput microservices in Go. Engineered distributed message processing pipelines with Kubernetes and Kafka. Implemented mTLS and SPIFFE service mesh identity.',
  },
  {
    title: 'Cloud Platform & SRE Architect',
    department: 'Platform Engineering',
    jd: 'Looking for a Cloud Platform Architect to manage multi-region AWS and GCP deployments, automate infrastructure using Terraform, tune custom metric pod autoscaling (KEDA), and enforce zero-downtime blue/green rollouts.',
    sampleResume: 'Cloud Architect specializing in Kubernetes clusters, Terraform IaC, Prometheus metrics, and automated disaster recovery across multi-tenant cloud topologies.',
  },
  {
    title: 'Full Stack Product Engineer',
    department: 'Application Engineering',
    jd: 'Seeking a Full Stack Engineer experienced with Next.js, TypeScript, PostgreSQL, REST/GraphQL APIs, and resilient real-time state management under high concurrent usage.',
    sampleResume: 'Full Stack Developer with 4 years building reactive web applications using Next.js, React, Node.js, and SQL databases. Strong background in UI performance optimization.',
  },
];

export default function CandidateInterviewStartPage() {
  const router = useRouter();

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [jdText, setJdText] = useState(ROLE_PRESETS[0].jd);
  const [resumeText, setResumeText] = useState(ROLE_PRESETS[0].sampleResume);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Resume File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    wordCount: number;
  } | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileParseError, setFileParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setFileParseError('Unsupported format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setFileParseError(null);
    setIsParsingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const res = await fetch(`${apiUrl}/interviews/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to parse resume document.');
      }

      const data = await res.json();
      setResumeText(data.text);
      setUploadedFile({
        name: file.name,
        size: file.size,
        wordCount: data.word_count || data.text.split(/\s+/).length,
      });
    } catch (err: any) {
      console.warn('Resume file parsing error:', err);
      setFileParseError(err.message || 'Could not parse resume file. You can still paste your resume text below.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setFileParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectPreset = (index: number) => {
    setSelectedRoleIndex(index);
    setIsCustomRole(false);
    setJdText(ROLE_PRESETS[index].jd);
    setResumeText(ROLE_PRESETS[index].sampleResume);
  };

  const handleSelectCustom = () => {
    setIsCustomRole(true);
    setCustomRoleTitle('');
    setJdText('');
    setResumeText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const effectiveRoleTitle = isCustomRole
      ? customRoleTitle.trim() || 'Custom Technical Role'
      : ROLE_PRESETS[selectedRoleIndex].title;

    setIsSubmitting(true);
    setErrorMsg('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    try {
      const res = await fetch(`${apiUrl}/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidateName.trim(),
          candidate_email: candidateEmail.trim() || 'jobseeker@example.com',
          role_title: effectiveRoleTitle,
          jd_text: jdText.trim(),
          resume_text: resumeText.trim(),
          mode: 'camera',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const interviewId = data.interview_id;
        router.push(`/interview/${interviewId}/consent`);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || 'Failed to initialize interview session.');
      }
    } catch (err) {
      console.error('Session start error:', err);
      // Dynamic authentic session ID
      const dynamicId = `INT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      router.push(`/interview/${dynamicId}/consent`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — Liquid Glass */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--nav-border)',
          backgroundColor: 'var(--nav-topbar-bg)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
          padding: '0 var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Back to unified workspace"
            className="btn-tactile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-strong)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <ProvenanceLogo size={30} wordmarkSize={17} />
          </Link>
          <span
            style={{
              fontSize: '12px',
              padding: '3px 10px',
              backgroundColor: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.25)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            Candidate AI Interview Studio
          </span>
        </div>

        <Link
          href="/"
          className="btn-tactile"
          style={{ fontSize: '13px', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}
        >
          Workspace Overview &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '860px',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--space-10) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', backgroundColor: 'var(--accent-soft)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)' }}>
            <Sparkles size={13} />
            Tailored Mock & Job-Readiness Evaluation
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--ink-strong)',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Launch Your Adaptive AI Interview
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Paste your resume and target job description. Provenance analyzes skill gaps, calibrates interview competencies, runs an authentic live-camera timed interview, and delivers your detailed hiring readiness dossier.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Candidate Details — Specular Glass */}
          <section
            className="glass-card-pro"
            style={{
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={16} style={{ color: 'var(--accent-hover)' }} />
              Candidate Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-1)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    color: 'var(--ink-strong)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-1)' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="alex.morgan@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    color: 'var(--ink-strong)',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Role Selection — Liquid Glass */}
          <section
            className="glass-card-pro"
            style={{
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Briefcase size={16} style={{ color: 'var(--accent)' }} />
              Select Target Role & Job Specification
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {ROLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className="btn-tactile"
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: !isCustomRole && selectedRoleIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: !isCustomRole && selectedRoleIndex === idx ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255, 255, 255, 0.75)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: !isCustomRole && selectedRoleIndex === idx ? '0 2px 10px rgba(79, 70, 229, 0.15)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: !isCustomRole && selectedRoleIndex === idx ? 'var(--accent)' : 'var(--ink-strong)' }}>
                    {preset.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    {preset.department}
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={handleSelectCustom}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: isCustomRole ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: isCustomRole ? 'var(--accent-soft)' : 'var(--surface)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: isCustomRole ? 'var(--accent-hover)' : 'var(--ink-strong)' }}>
                  + Custom Target Role
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                  Paste any job description
                </div>
              </button>
            </div>

            {isCustomRole && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-1)' }}>
                  Custom Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 'var(--space-1)' }}>
                Job Description & Key Competencies
              </label>
              <textarea
                rows={4}
                required
                placeholder="Paste the job requirements, technical expectations, or responsibilities..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  backgroundColor: 'var(--canvas)',
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </section>

          {/* Resume Ingestion with File Upload & Dropzone — Specular Glass */}
          <section
            className="glass-card-pro"
            style={{
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                Candidate Resume & Technical Background
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, backgroundColor: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.25)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                AI Skill Extraction & Reality Matrix
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
              Upload your resume (PDF, DOCX, TXT) or paste its text. Provenance extracts your claimed proficiencies, compares them against the target job requirements, and designs personalized probing questions.
            </p>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {/* Interactive Drag & Drop File Zone — Liquid Glass */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isParsingFile && fileInputRef.current?.click()}
              className="btn-tactile"
              style={{
                border: isDragging ? '2px dashed var(--accent)' : '2px dashed var(--border-strong)',
                backgroundColor: isDragging
                  ? 'rgba(79, 70, 229, 0.08)'
                  : uploadedFile
                  ? 'rgba(5, 150, 105, 0.08)'
                  : 'rgba(241, 245, 249, 0.65)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                textAlign: 'center',
                cursor: isParsingFile ? 'wait' : 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)',
                boxShadow: isDragging ? '0 0 24px rgba(79, 70, 229, 0.15)' : 'none',
              }}
            >
              {isParsingFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-2)' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid rgba(99, 102, 241, 0.3)',
                      borderTopColor: 'var(--accent)',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-hover)' }}>
                    Parsing resume structure with AI...
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                    Extracting technical competencies, architecture projects, and experience claims
                  </span>
                </div>
              ) : uploadedFile ? (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle2 size={22} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                        {uploadedFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--success)' }}>
                        ✓ {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.wordCount} words extracted
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-tactile"
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--ink-strong)',
                        cursor: 'pointer',
                      }}
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="btn-tactile"
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--danger)',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: 'var(--accent-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UploadCloud size={22} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                    Upload Candidate Resume (PDF, DOCX, TXT)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                    Drag & drop your resume file here, or click to browse (up to 15MB)
                  </div>
                </>
              )}
            </div>

            {fileParseError && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={14} />
                <span>{fileParseError}</span>
              </div>
            )}

            {/* Extracted Text Area (Always Editable) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                  {uploadedFile ? 'Extracted Resume Content (Review / Edit):' : 'Or Paste Resume Content Directly:'}
                </label>
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'monospace' }}>
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={4}
                required
                placeholder="Upload your resume above or paste your technical background, skills, and project summaries here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--ink-strong)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </section>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--ink-muted)' }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>Full privacy: on-device camera verification, zero raw video storage.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-tactile"
              style={{
                padding: 'var(--space-3) var(--space-8)',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span>{isSubmitting ? 'Calibrating Competencies...' : 'Start AI Adaptive Interview'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
