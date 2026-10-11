'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  X,
  Compass,
  Zap,
  Layers,
  MousePointer2,
  Activity,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  useAtmosphere,
  AtmospherePreset,
  MotionSpeed,
} from '@/context/AtmosphereContext';

export const AtmosphereDial: React.FC = () => {
  const {
    preset,
    setPreset,
    motionSpeed,
    setMotionSpeed,
    dotInteractionEnabled,
    setDotInteractionEnabled,
    dotDisplacementForce,
    setDotDisplacementForce,
    cardTiltEnabled,
    setCardTiltEnabled,
    clickWaveEnabled,
    setClickWaveEnabled,
    resetDefaults,
  } = useAtmosphere();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const PRESET_OPTIONS: { id: AtmospherePreset; name: string; tag: string; colors: string[] }[] = [
    {
      id: 'nebula',
      name: 'Nebula Drift',
      tag: 'Indigo & Cyan',
      colors: ['#4F46E5', '#06B6D4'],
    },
    {
      id: 'matrix',
      name: 'Cyan Matrix',
      tag: 'Cyber Teal & Sky',
      colors: ['#0D9488', '#0284C7'],
    },
    {
      id: 'obsidian',
      name: 'Deep Obsidian',
      tag: 'Executive Dark',
      colors: ['#0F172A', '#6366F1'],
    },
    {
      id: 'emerald',
      name: 'Emerald Pulse',
      tag: 'Mint & Lime',
      colors: ['#10B981', '#84CC16'],
    },
  ];

  const SPEED_OPTIONS: { id: MotionSpeed; label: string; desc: string }[] = [
    { id: 'zen', label: 'Zen', desc: 'Calm & Slow' },
    { id: 'flow', label: 'Flow', desc: 'Smooth Balanced' },
    { id: 'dynamic', label: 'Dynamic', desc: 'Lively Fluid' },
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99,
      }}
    >
      {/* Floating Atmosphere Pill Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-tactile"
          title="Open Live Atmosphere Dial"
          aria-label="Open Live Atmosphere Dial"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            outline: '1px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.10), 0 0 16px -2px rgba(99, 102, 241, 0.15)',
            cursor: 'pointer',
            color: 'var(--ink-strong)',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              boxShadow: '0 0 8px #4F46E5',
            }}
          />
          <Sparkles size={14} color="var(--accent)" />
          <span>Atmosphere Dial</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--ink-muted)',
              textTransform: 'capitalize',
            }}
          >
            {preset}
          </span>
        </button>
      )}

      {/* Floating Control Popover Panel */}
      {isOpen && (
        <div
          className="animate-in-modal"
          style={{
            width: '320px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            outline: '1px solid rgba(226, 232, 240, 0.90)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 0 32px -4px rgba(99, 102, 241, 0.18)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sliders size={16} color="var(--accent)" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-strong)', lineHeight: 1.2 }}>
                  Atmosphere Tuner
                </h4>
                <p style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>Real-time physics & ambient dials</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Atmosphere Tuner"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink-soft)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Preset Selector Grid */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', display: 'block', marginBottom: '6px' }}>
              AMBIENT PRESET
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {PRESET_OPTIONS.map((opt) => {
                const isActive = preset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreset(opt.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.70)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {opt.colors.map((c, i) => (
                          <span
                            key={i}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: c,
                              display: 'inline-block',
                            }}
                          />
                        ))}
                      </div>
                      {isActive && <Check size={12} color="var(--accent)" />}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-strong)', marginTop: '4px' }}>
                      {opt.name}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--ink-soft)' }}>
                      {opt.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motion Rhythm Speed */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', display: 'block', marginBottom: '6px' }}>
              MOTION RHYTHM
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {SPEED_OPTIONS.map((spd) => {
                const isActive = motionSpeed === spd.id;
                return (
                  <button
                    key={spd.id}
                    type="button"
                    onClick={() => setMotionSpeed(spd.id)}
                    style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.70)',
                      color: isActive ? '#FFFFFF' : 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {spd.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Dials & Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            {/* Background Dots Displacement Force Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MousePointer2 size={12} color="var(--accent)" />
                  Background Dots React
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                  {dotInteractionEnabled ? `${Math.round(dotDisplacementForce * 100)}% Force` : 'Disabled'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dotInteractionEnabled ? Math.round(dotDisplacementForce * 100) : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val === 0) {
                    setDotInteractionEnabled(false);
                  } else {
                    setDotInteractionEnabled(true);
                    setDotDisplacementForce(val / 100);
                  }
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* 3D Card Tilt Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={12} color="var(--accent)" />
                3D Card Gyro Tilt
              </span>
              <input
                type="checkbox"
                checked={cardTiltEnabled}
                onChange={(e) => setCardTiltEnabled(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: '16px', height: '16px' }}
              />
            </div>

            {/* Quantum Click Wave Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={12} color="var(--accent)" />
                Quantum Click Waves
              </span>
              <input
                type="checkbox"
                checked={clickWaveEnabled}
                onChange={(e) => setClickWaveEnabled(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: '16px', height: '16px' }}
              />
            </div>
          </div>

          {/* Footer Reset */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={resetDefaults}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              <RotateCcw size={11} />
              Reset Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
