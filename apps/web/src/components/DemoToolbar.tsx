'use client';

import React from 'react';
import {
  Play,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

import { useScenario, ScenarioId } from '@/context/ScenarioContext';

interface DemoPreset {
  id: ScenarioId;
  label: string;
  subtitle: string;
  tag: string;
  icon: React.ReactNode;
}

const PRESETS: DemoPreset[] = [
  {
    id: 'G1',
    label: 'G1: Verified Senior',
    subtitle: 'High evidence, difficulty rises, verified skills',
    tag: 'Verified',
    icon: <CheckCircle2 size={13} color="var(--success)" />,
  },
  {
    id: 'G3',
    label: 'G3: Bluffer Drilldown',
    subtitle: 'Resume claimed, shallow answer triggers drill',
    tag: 'Adaptive',
    icon: <Sparkles size={13} color="var(--accent)" />,
  },
  {
    id: 'G5',
    label: 'G5: Injection Blocked',
    subtitle: 'Delimiter containment neutralizes attack',
    tag: 'Guard',
    icon: <ShieldAlert size={13} color="var(--danger)" />,
  },
  {
    id: 'G7',
    label: 'G7: Integrity Review',
    subtitle: 'Corroborating telemetry + benign reasons',
    tag: 'Integrity',
    icon: <AlertTriangle size={13} color="var(--warning)" />,
  },
];

const TURNS = [
  { turn: 1, label: 'T1: Warmup' },
  { turn: 3, label: 'T3: Probe' },
  { turn: 6, label: 'T6: Intercept' },
  { turn: 9, label: 'T9: Synthesis' },
];

export const DemoToolbar: React.FC = () => {
  const {
    activeScenarioId,
    setScenario,
    selectedTurn,
    setSelectedTurn,
    isCinemaMode,
    toggleCinemaMode,
    isSoundEnabled,
    toggleSound,
    playCrystalSound,
    setHotkeysModalOpen,
  } = useScenario();

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 8px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        padding: '6px var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        zIndex: 40,
      }}
    >
      {/* Left: Replay Title & Benchmark Scenarios */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Play size={11} fill="currentColor" /> Live Scenario Engine:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {PRESETS.map((p) => {
            const isSelected = activeScenarioId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setScenario(p.id)}
                title={p.subtitle}
                className="btn-tactile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                  color: isSelected ? 'var(--accent)' : 'var(--ink)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: isSelected
                    ? '0 2px 6px rgba(79, 70, 229, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: Interactive Time-Travel Turn Scrubber */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 4px',
          backgroundColor: 'rgba(241, 245, 249, 0.8)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)', padding: '0 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={11} /> Turn:
        </span>
        {TURNS.map((t) => {
          const isTurnActive = selectedTurn === t.turn;
          return (
            <button
              key={t.turn}
              onClick={() => {
                setSelectedTurn(t.turn);
                playCrystalSound('click');
              }}
              className="btn-tactile"
              style={{
                fontSize: '11px',
                fontWeight: isTurnActive ? 700 : 500,
                padding: '2px 8px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: isTurnActive ? '#FFFFFF' : 'transparent',
                color: isTurnActive ? 'var(--accent)' : 'var(--ink-muted)',
                boxShadow: isTurnActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right: Sound, Cinema Mode, & Hotkeys */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Tactile Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? 'Crystal sound active (Click to mute)' : 'Enable crystal audio feedback'}
          className="btn-tactile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            backgroundColor: isSoundEnabled ? 'rgba(5, 150, 105, 0.10)' : 'rgba(255, 255, 255, 0.8)',
            border: isSoundEnabled ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid var(--border)',
            color: isSoundEnabled ? 'var(--success)' : 'var(--ink-muted)',
            cursor: 'pointer',
          }}
        >
          {isSoundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{isSoundEnabled ? 'Sound On' : 'Sound Off'}</span>
        </button>


        {/* Hotkeys Helper */}
        <button
          onClick={() => setHotkeysModalOpen(true)}
          title="View Keyboard Hotkeys (?)"
          className="btn-tactile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--border)',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
          }}
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </div>
  );
};
