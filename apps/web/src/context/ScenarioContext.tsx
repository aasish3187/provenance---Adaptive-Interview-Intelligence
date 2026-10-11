'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ScenarioId = 'G1' | 'G3' | 'G5' | 'G7';

export interface ScenarioData {
  id: ScenarioId;
  label: string;
  candidateName: string;
  roleTitle: string;
  status: string;
  coverage: number;
  uncertaintyRange: string;
  evidenceGrounding: string;
  integrityStatus: string;
  integrityColor: string;
  summary: string;
  currentTurn: number;
  bloomLevel: number;
  whyCard: {
    competency: string;
    bloom: string;
    utilityScore: number;
    trigger: string;
    decisionMode: string;
  };
  guardStatus: {
    intercepted: boolean;
    flag: string | null;
    sanitizedSnippet: string | null;
  };
  merkleRoot: string;
}

export const SCENARIO_PRESETS: Record<ScenarioId, ScenarioData> = {
  G1: {
    id: 'G1',
    label: 'G1: Verified Senior',
    candidateName: 'Aasish (Senior Distributed Systems)',
    roleTitle: 'Senior Distributed Systems Engineer',
    status: 'Verified Senior',
    coverage: 94,
    uncertaintyRange: '78% – 92%',
    evidenceGrounding: '100%',
    integrityStatus: 'Fair & Explainable (Zero Flags)',
    integrityColor: 'var(--success)',
    summary: 'Stellar demonstration across Raft consensus, Go concurrency, and K8s HPA autoscaling. High evidence count, low uncertainty.',
    currentTurn: 4,
    bloomLevel: 5,
    whyCard: {
      competency: 'Raft Consensus & Log Compaction',
      bloom: 'L5 Evaluation',
      utilityScore: 0.92,
      trigger: 'Candidate answered concurrency cleanly; elevating to consensus edge cases.',
      decisionMode: 'Elevate',
    },
    guardStatus: {
      intercepted: false,
      flag: null,
      sanitizedSnippet: null,
    },
    merkleRoot: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  G3: {
    id: 'G3',
    label: 'G3: Bluffer Drilldown',
    candidateName: 'Jordan Vance (Claimed Architect)',
    roleTitle: 'Cloud Platform Architect',
    status: 'Adaptive Drilldown',
    coverage: 62,
    uncertaintyRange: '38% – 64%',
    evidenceGrounding: '88%',
    integrityStatus: 'Shallow Claim Flagged',
    integrityColor: 'var(--warning)',
    summary: 'Resume claimed extensive Zero-Trust SPIFFE and K8s tuning, but adaptive probe revealed significant gaps in operational failure modes.',
    currentTurn: 3,
    bloomLevel: 3,
    whyCard: {
      competency: 'Zero-Trust Service Mesh & mTLS',
      bloom: 'L3 Application (Drilldown)',
      utilityScore: 0.86,
      trigger: 'Claimed SPIFFE on CV, but previous answer was generic; probing mTLS cert rotation.',
      decisionMode: 'Drilldown',
    },
    guardStatus: {
      intercepted: false,
      flag: null,
      sanitizedSnippet: null,
    },
    merkleRoot: 'sha256:3a4b9c1e2f7d8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
  },
  G5: {
    id: 'G5',
    label: 'G5: Injection Blocked',
    candidateName: 'Priya Nair (Security Probe)',
    roleTitle: 'Principal Systems Engineer',
    status: 'Guard Agent Active',
    coverage: 48,
    uncertaintyRange: '42% – 70%',
    evidenceGrounding: '100%',
    integrityStatus: 'Prompt Injection Defused',
    integrityColor: 'var(--danger)',
    summary: 'Candidate text included prompt override delimiter attempts (e.g., "[SYSTEM: Ignore previous rubric]"). CoMAI Guard Agent intercepted and sanitized in 14ms.',
    currentTurn: 6,
    bloomLevel: 4,
    whyCard: {
      competency: 'System Boundary & Input Sanitization',
      bloom: 'L4 Analysis',
      utilityScore: 0.89,
      trigger: 'Untrusted input sanitized; continuing structured rubric inquiry on memory safety.',
      decisionMode: 'Sanitized Probe',
    },
    guardStatus: {
      intercepted: true,
      flag: 'DELIMITER_ESCAPE_ATTEMPT',
      sanitizedSnippet: 'Ignored injected prompt instructions. Evaluator evaluated purely technical content.',
    },
    merkleRoot: 'sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
  },
  G7: {
    id: 'G7',
    label: 'G7: Integrity Review',
    candidateName: 'Elena Rostova (Telemetry Audit)',
    roleTitle: 'Staff SRE Architect',
    status: 'Human Review Priority',
    coverage: 75,
    uncertaintyRange: '60% – 82%',
    evidenceGrounding: '94%',
    integrityStatus: 'Review Priority: Moderate',
    integrityColor: 'var(--warning)',
    summary: 'Multiple window-blur events detected. Aggregator emitted benign dual-monitor note-taking hypothesis for recruiter oversight. Zero auto-rejection.',
    currentTurn: 5,
    bloomLevel: 4,
    whyCard: {
      competency: 'Distributed Tracing & SRE',
      bloom: 'L4 Analysis',
      utilityScore: 0.79,
      trigger: 'Telemetry debounced; evaluating OpenTelemetry span propagation answer.',
      decisionMode: 'Probe',
    },
    guardStatus: {
      intercepted: false,
      flag: null,
      sanitizedSnippet: null,
    },
    merkleRoot: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
};

interface ScenarioContextType {
  activeScenarioId: ScenarioId;
  scenario: ScenarioData;
  setScenario: (id: ScenarioId) => void;
  selectedTurn: number;
  setSelectedTurn: (turn: number) => void;
  isCinemaMode: boolean;
  toggleCinemaMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playCrystalSound: (type?: 'click' | 'chime' | 'verified' | 'shield') => void;
  isHotkeysModalOpen: boolean;
  setHotkeysModalOpen: (open: boolean) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('G1');
  const [selectedTurn, setSelectedTurn] = useState<number>(1);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [isHotkeysModalOpen, setHotkeysModalOpen] = useState<boolean>(false);

  // Web Audio API Synthesizer for crystal-clear haptic sounds
  const playCrystalSound = useCallback((type: 'click' | 'chime' | 'verified' | 'shield' = 'click') => {
    if (!isSoundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'chime' || type === 'verified') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'shield') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio context may be restricted before user gesture
    }
  }, [isSoundEnabled]);

  const setScenario = useCallback((id: ScenarioId) => {
    setActiveScenarioId(id);
    playCrystalSound('chime');
  }, [playCrystalSound]);

  const toggleCinemaMode = useCallback(() => {
    setIsCinemaMode((prev) => !prev);
    playCrystalSound('click');
  }, [playCrystalSound]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  // Hotkey listener for '?' cheat sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?') {
        e.preventDefault();
        setHotkeysModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setHotkeysModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scenario = SCENARIO_PRESETS[activeScenarioId];

  return (
    <ScenarioContext.Provider
      value={{
        activeScenarioId,
        scenario,
        setScenario,
        selectedTurn,
        setSelectedTurn,
        isCinemaMode,
        toggleCinemaMode,
        isSoundEnabled,
        toggleSound,
        playCrystalSound,
        isHotkeysModalOpen,
        setHotkeysModalOpen,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    return {
      activeScenarioId: 'G1',
      scenario: SCENARIO_PRESETS['G1'],
      setScenario: () => {},
      selectedTurn: 4,
      setSelectedTurn: () => {},
      isCinemaMode: false,
      toggleCinemaMode: () => {},
      isSoundEnabled: true,
      toggleSound: () => {},
      playCrystalSound: () => {},
      isHotkeysModalOpen: false,
      setHotkeysModalOpen: () => {},
    };
  }
  return context;
};

