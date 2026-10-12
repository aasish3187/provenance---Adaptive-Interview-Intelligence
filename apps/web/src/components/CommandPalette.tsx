'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  FileCheck2,
  Briefcase,
  Users,
  ShieldAlert,
  ArrowRight,
  X,
  Database,
  ExternalLink,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'Sessions' | 'Roles' | 'Actions';
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Sessions
  {
    id: 'sess-aasish',
    category: 'Sessions',
    title: 'Aasish — Senior Distributed Systems',
    subtitle: '88% Coverage • 100% Verified Spans • Completed',
    href: '/recruiter/reports?session=sess_demo_aasish',
    icon: <FileCheck2 size={16} className="text-emerald-400" />,
    badge: 'Verified Dossier',
  },
  {
    id: 'sess-priya',
    category: 'Sessions',
    title: 'Priya Nair — Cloud Platform Architect',
    subtitle: '42% Coverage • Beta Uncertainty [0.38, 0.74] • In Progress',
    href: '/recruiter/reports?session=sess_demo_priya',
    icon: <Users size={16} />,
    badge: 'Live Session',
  },
  {
    id: 'sess-marcus',
    category: 'Sessions',
    title: 'Marcus Vance — Principal Distributed Systems',
    subtitle: '91% Coverage • Evaluated Level 5 Bloom • Completed',
    href: '/recruiter/reports?session=sess_demo_marcus',
    icon: <FileCheck2 size={16} />,
    badge: '91% Match',
  },
  {
    id: 'sess-elena',
    category: 'Sessions',
    title: 'Elena Rostova — Staff SRE Architect',
    subtitle: 'Flagged Ambiguity Spans • Review Priority High',
    href: '/recruiter/reports?session=sess_demo_elena',
    icon: <ShieldAlert size={16} className="text-amber-400" />,
    badge: 'Needs Review',
  },

  // Roles
  {
    id: 'role-dist',
    category: 'Roles',
    title: 'Senior Distributed Systems Engineer',
    subtitle: 'Blueprint with 5 Competencies: Raft, Go Concurrency, Goroutine Pools',
    href: '/recruiter/roles',
    icon: <Briefcase size={16} />,
    badge: 'Blueprint',
  },
  {
    id: 'role-cloud',
    category: 'Roles',
    title: 'Cloud Platform & SRE Architect',
    subtitle: 'Multi-Region Kubernetes, Terraform IaC, KEDA Autoscaling',
    href: '/recruiter/roles',
    icon: <Briefcase size={16} />,
    badge: 'Blueprint',
  },
  {
    id: 'role-aiml',
    category: 'Roles',
    title: 'AI & ML Infrastructure Specialist',
    subtitle: 'vLLM Serving, PyTorch DDP, GPU Cluster Orchestration',
    href: '/recruiter/roles',
    icon: <Briefcase size={16} />,
    badge: 'Blueprint',
  },

  // Actions
  {
    id: 'act-practice',
    category: 'Actions',
    title: 'Launch Adaptive AI Practice Room',
    subtitle: 'Voice-to-Voice Gemini Live session with simulated adaptive questioning',
    href: '/interview/start',
    icon: <Sparkles size={16} className="text-indigo-400" />,
    badge: 'Live AI',
  },
  {
    id: 'act-audit',
    category: 'Actions',
    title: 'Inspect Cryptographic Privacy Ledger',
    subtitle: 'EU AI Act, Illinois BIPA & timestamped consent hash verification',
    href: '/recruiter/audit',
    icon: <Database size={16} className="text-emerald-400" />,
    badge: 'Tamper-Evident',
  },
  {
    id: 'act-launchpad',
    category: 'Actions',
    title: 'Overview Architecture Launchpad',
    subtitle: 'View 5 Core Architecture Modules & Live Telemetry',
    href: '/',
    icon: <ArrowRight size={16} />,
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<CommandItem[]>(COMMAND_ITEMS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchLiveSessions() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/interviews`);
        if (res.ok) {
          const list: any[] = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const liveItems: CommandItem[] = list.slice(0, 8).map((s) => ({
              id: `sess-${s.id}`,
              category: 'Sessions',
              title: `${s.candidate_name || 'Candidate'} — ${s.role_title || 'Engineering'}`,
              subtitle: `${s.id} • ${s.state === 'COMPLETED' ? 'Completed' : 'In Progress'} • ${s.verified_evidence_count || 0} quotes`,
              href: `/recruiter/reports?session=${s.id}`,
              icon: <FileCheck2 size={16} className="text-emerald-400" />,
              badge: s.state === 'COMPLETED' ? 'Verified Dossier' : 'In Progress',
            }));

            // Replace mock sessions with live sessions
            const nonSessionItems = COMMAND_ITEMS.filter((i) => i.category !== 'Sessions');
            setItems([...liveItems, ...nonSessionItems]);
          }
        }
      } catch (err) {
        console.warn('CommandPalette live session fetch fallback:', err);
      }
    }

    if (isOpen) {
      fetchLiveSessions();
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or global listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const text = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const handleSelect = (item: CommandItem) => {
    onClose();
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-in-modal"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px -8px rgba(15, 23, 42, 0.16), 0 0 32px -4px rgba(79, 70, 229, 0.12), inset 0 1.5px 2px 0 rgba(255, 255, 255, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'rgba(248, 250, 252, 0.85)',
          }}
        >
          <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search candidates, roles, actions, or jump anywhere..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--ink-strong)',
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--ink-muted)', padding: '4px' }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--ink-muted)',
                fontFamily: 'monospace',
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: 'var(--ink-muted)',
                fontSize: '14px',
              }}
            >
              No commands or sessions match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.15)' : 'rgba(241, 245, 249, 0.9)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'var(--accent)' : 'var(--ink-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: isSelected ? 'var(--ink-strong)' : 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--ink-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(241, 245, 249, 0.9)',
                          color: 'var(--ink-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--ink-soft)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(248, 250, 252, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--ink-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              <kbd style={{ padding: '1px 5px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--border)', borderRadius: '3px' }}>↑</kbd>{' '}
              <kbd style={{ padding: '1px 5px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--border)', borderRadius: '3px' }}>↓</kbd> to navigate
            </span>
            <span>
              <kbd style={{ padding: '1px 5px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--border)', borderRadius: '3px' }}>↵</kbd> to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
