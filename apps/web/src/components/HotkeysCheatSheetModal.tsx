'use client';

import React from 'react';
import { X, Command, Keyboard, Zap, Play, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';

export const HotkeysCheatSheetModal: React.FC = () => {
  const { isHotkeysModalOpen, setHotkeysModalOpen } = useScenario();

  if (!isHotkeysModalOpen) return null;

  const hotkeys = [
    { key: '⌘K / Ctrl+K', description: 'Open Spotlight Command Palette & instant search', category: 'Navigation' },
    { key: '?', description: 'Open this Keyboard Shortcuts guide', category: 'Help' },
    { key: 'Esc', description: 'Dismiss active modal, palette, or evidence drawer', category: 'Navigation' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        padding: '20px',
      }}
      onClick={() => setHotkeysModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card-pro"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px -12px rgba(15, 23, 42, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(79, 70, 229, 0.10)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Keyboard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Platform Keyboard Shortcuts
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)' }}>
                Essential productivity shortcuts for rapid navigation and auditing
              </p>
            </div>
          </div>
          <button
            onClick={() => setHotkeysModalOpen(false)}
            className="btn-tactile"
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hotkeys.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                backgroundColor: 'rgba(248, 250, 252, 0.85)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                {h.description}
              </span>
              <kbd
                style={{
                  padding: '3px 8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--accent)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                {h.key}
              </kbd>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--ink-soft)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent)" /> Press <kbd style={{ padding: '1px 4px', background: '#eee', borderRadius: '3px' }}>?</kbd> anytime to reveal
          </span>
          <button
            onClick={() => setHotkeysModalOpen(false)}
            className="btn-tactile"
            style={{
              padding: '5px 14px',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
