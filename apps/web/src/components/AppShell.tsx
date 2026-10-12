'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileCheck2,
  ShieldAlert,
  Search,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  Zap,
  Settings,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';

import { CommandPalette } from './CommandPalette';

import { EngineDiagnosticsModal } from './EngineDiagnosticsModal';
import { ProvenanceManifestoModal } from './ProvenanceManifestoModal';
import { ScenarioProvider, useScenario } from '@/context/ScenarioContext';
import { HotkeysCheatSheetModal } from './HotkeysCheatSheetModal';
import { ProvenanceLogo } from './ProvenanceLogo';
import { useAuth } from '@/context/AuthContext';


interface AppShellProps {
  children: React.ReactNode;
}

const AppShellInner: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isCinemaMode } = useScenario();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isOverview = pathname === '/' || pathname === '/recruiter';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Overview', href: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Roles', href: '/recruiter/roles', icon: <Briefcase size={18} /> },
    { label: 'Take Interview', href: '/interview/start', icon: <Sparkles size={18} /> },
    { label: 'Interviews', href: '/recruiter/interviews', icon: <Users size={18} /> },
    { label: 'Reports', href: '/recruiter/reports', icon: <FileCheck2 size={18} /> },
    { label: 'Audit Log', href: '/recruiter/audit', icon: <ShieldAlert size={18} /> },
    { label: 'Settings', href: '/recruiter/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'var(--ink)',
      }}
    >
      {/* Global Command Palette Spotlight */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global Engine Diagnostics Modal */}
      <EngineDiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />

      {/* Global Hotkeys Cheat Sheet Modal */}
      <HotkeysCheatSheetModal />

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Recruiter Sidebar (232px Desktop) — Liquid Crystal Glass */}
      <aside
        style={{
          width: '232px',
          backgroundColor: 'var(--nav-sidebar-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid var(--nav-border)',
          boxShadow: '4px 0 24px -2px rgba(15, 23, 42, 0.04), inset -1px 0 0 rgba(255, 255, 255, 0.9)',
          display: isCinemaMode ? 'none' : 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transform: sidebarCollapsed ? 'translateX(-100%)' : (mobileMenuOpen ? 'translateX(0)' : undefined),
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={mobileMenuOpen ? 'mobile-nav-open' : 'desktop-nav'}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '64px',
            borderBottom: '1px solid var(--nav-border)',
            padding: '0 var(--space-4) 0 var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <ProvenanceLogo size={30} wordmarkSize={17} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Small 3-line hamburger menu beside Provenance logo that collapses the sidebar */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              title="Close sidebar"
              aria-label="Close sidebar"
              className="btn-tactile"
              style={{
                background: 'rgba(241, 245, 249, 0.8)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink-strong)',
                transition: 'all 150ms ease',
              }}
            >
              <Menu size={16} />
            </button>

            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                style={{ color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>


        {/* Workspace Identifier */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--nav-border)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700 }}>
            Candidate Workspace
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-strong)', marginTop: '2px' }}>
            Practice Launchpad
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '1px' }}>
            AI Adaptive Preparation
          </div>
        </div>

        {/* Quick Search Shortcut Trigger */}
        <div style={{ padding: 'var(--space-3) var(--space-3) 0 var(--space-3)' }}>
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="btn-tactile"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} style={{ color: 'var(--ink-soft)' }} />
              <span>Search...</span>
            </span>
            <kbd
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                backgroundColor: 'rgba(241, 245, 249, 0.9)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                color: 'var(--ink-soft)',
                fontFamily: 'monospace',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: 'var(--space-3) var(--space-3)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-tactile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '9px var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--ink-muted)',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)' : 'none',
                  transition: 'all 140ms ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--accent)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom System & Demo Flag — Liquid Presence Seal */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--nav-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink-muted)' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px rgba(5, 150, 105, 0.6)',
              }}
            />
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Privacy Sovereign</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>
            On-device presence counts only
          </div>
        </div>
      </aside>

      {/* Main Container Area (Offset by 232px sidebar unless Cinema Mode or Sidebar Collapsed) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: isCinemaMode || sidebarCollapsed ? 0 : '232px',
          minWidth: 0,
          transition: 'margin-left 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="main-viewport-container"
      >
        {/* Top Bar (64px) with Frosted Liquid Glass */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--nav-topbar-bg)',
            backdropFilter: 'var(--backdrop-blur)',
            WebkitBackdropFilter: 'var(--backdrop-blur)',
            borderBottom: '1px solid var(--nav-border)',
            boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            padding: '0 var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Mobile toggle & Back button / Re-open sidebar button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation"
              className="mobile-menu-trigger"
              style={{ display: 'none', color: 'var(--ink)' }}
            >
              <Menu size={20} />
            </button>

            {sidebarCollapsed && !isCinemaMode && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand navigation sidebar"
                aria-label="Expand navigation sidebar"
                className="btn-tactile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--ink-strong)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Menu size={16} />
              </button>
            )}

            {!isOverview && (

              <>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  aria-label="Back to main overview"
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
                    transition: 'all 150ms ease',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }} />
              </>
            )}

            {/* Clickable Logo and Breadcrumb hierarchy */}
            <Link
              href="/"
              title="Return to Provenance Unified Workspace"
              style={{ textDecoration: 'none' }}
            >
              <ProvenanceLogo size={24} wordmarkSize={14} />
            </Link>

            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)', fontWeight: 500 }}>
              {pathname === '/'
                ? 'Candidate Practice Launchpad'
                : pathname.startsWith('/recruiter/roles')
                ? 'Target Roles & Blueprints'
                : pathname.startsWith('/recruiter/interviews')
                ? 'My Practice Sessions'
                : pathname.startsWith('/recruiter/reports')
                ? 'My Evidence Dossier'
                : pathname.startsWith('/recruiter/audit')
                ? 'Privacy & Audit Log'
                : pathname.startsWith('/interview/start')
                ? 'Take Interview'
                : pathname.includes('/report')
                ? 'My Evidence Dossier'
                : 'Candidate Practice Launchpad'}
            </span>
          </div>

          {/* Right Topbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Interactive Workflow & Architecture Spec Trigger */}
            <button
              type="button"
              onClick={() => setManifestoOpen(true)}
              title="Click to view Track 03 Workflow Architecture & 5-Module Data Flow Diagram"
              className="btn-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                backgroundColor: 'rgba(99, 102, 241, 0.10)',
                border: '1px solid rgba(99, 102, 241, 0.30)',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent)',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(99, 102, 241, 0.15)',
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--accent)' }} />
              <span>Workflow & Architecture</span>
            </button>

            {/* Interactive Live Engine Radar Chip (Click to open diagnostics) */}
            <button
              type="button"
              onClick={() => setDiagnosticsOpen(true)}
              title="Click to view live Gemini engine diagnostics & latency"
              className="btn-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                backgroundColor: 'rgba(5, 150, 105, 0.10)',
                border: '1px solid rgba(5, 150, 105, 0.30)',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--success)',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(5, 150, 105, 0.15)',
              }}
            >
              <span className="radar-beacon" />
              <span>Live Engine</span>
            </button>

            {/* Authenticated User Profile Pill & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="btn-tactile"
                aria-label="User account menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  {user
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'GS'}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-strong)', lineHeight: 1.2 }}>
                    {user?.name || 'Guest User'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--ink-soft)', lineHeight: 1.2, textTransform: 'capitalize' }}>
                    {user?.role || 'Guest'}
                  </span>
                </div>
                <ChevronDown size={13} color="var(--ink-soft)" />
              </button>

              {/* User Dropdown Popover */}
              {userDropdownOpen && (
                <>
                  <div
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  />
                  <div
                    className="animate-in-modal"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '240px',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-popover)',
                      backdropFilter: 'var(--backdrop-blur)',
                      padding: 'var(--space-3)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)' }}>
                        {user?.name || 'Guest Session'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                        {user?.email || 'Not authenticated'}
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          backgroundColor: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {user?.organization_name || 'Provenance Enterprise'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Link
                        href="/recruiter/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        <Settings size={14} color="var(--ink-muted)" />
                        <span>Platform Settings</span>
                      </Link>

                      <Link
                        href="/auth/login"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        <LogIn size={14} color="var(--ink-muted)" />
                        <span>Switch Account / Login</span>
                      </Link>

                      <Link
                        href="/auth/signup"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        <Sparkles size={14} color="var(--accent)" />
                        <span>Sign Up New User</span>
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          router.push('/auth/login');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--danger)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main
          style={{
            flex: 1,
            padding: 'var(--space-8)',
            maxWidth: 'var(--content-max)',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <EngineDiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />
      <ProvenanceManifestoModal
        isOpen={manifestoOpen}
        onClose={() => setManifestoOpen(false)}
      />

      <style jsx global>{`
        @media (max-width: 1023px) {
          aside.desktop-nav {
            transform: translateX(-100%);
          }
          .mobile-nav-open {
            transform: translateX(0) !important;
          }
          .main-viewport-container {
            margin-left: 0 !important;
          }
          .mobile-menu-trigger {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return <AppShellInner>{children}</AppShellInner>;
};


