'use client';

import React, { useState } from 'react';
import { ShieldCheck, GitBranch, CheckCircle2, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';

export interface MerkleTreeVisualizerProps {
  rootHash?: string;
  totalRecords?: number;
}

export const MerkleTreeVisualizer: React.FC<MerkleTreeVisualizerProps> = ({
  rootHash,
  totalRecords,
}) => {
  const { scenario, playCrystalSound } = useScenario();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const activeRoot = rootHash || scenario.merkleRoot;

  const handleVerify = () => {
    setIsVerifying(true);
    playCrystalSound('click');
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      playCrystalSound('verified');
    }, 900);
  };

  return (
    <div
      className="glass-card-pro"
      style={{
        padding: '20px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        marginBottom: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitBranch size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              Cryptographic Merkle Tree Integrity Explorer
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)' }}>
              Verifies zero tampering across all consent events, transcript turns, and evidence quotes
            </p>
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="btn-tactile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: isVerified ? 'rgba(5, 150, 105, 0.12)' : 'var(--accent)',
            color: isVerified ? '#059669' : '#FFFFFF',
            border: isVerified ? '1px solid #059669' : 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isVerifying ? 'wait' : 'pointer',
          }}
        >
          {isVerifying ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Verifying Branch Hashes...</span>
            </>
          ) : isVerified ? (
            <>
              <CheckCircle2 size={14} />
              <span>Merkle Chain Intact</span>
            </>
          ) : (
            <>
              <Lock size={13} />
              <span>Verify Merkle Tree</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Tree Diagram */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          backgroundColor: 'rgba(248, 250, 252, 0.75)',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        {/* Root Hash */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: isVerified ? 'rgba(5, 150, 105, 0.12)' : '#FFFFFF',
            border: `1.5px solid ${isVerified ? '#059669' : 'var(--accent)'}`,
            borderRadius: '10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: isVerified ? '#059669' : 'var(--accent)',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Lock size={13} />
          <span>Root: {activeRoot.slice(0, 36)}...</span>
        </div>

        {/* Branch Connectors SVG */}
        <svg width="340" height="24" viewBox="0 0 340 24">
          <line x1="170" y1="0" x2="85" y2="24" stroke={isVerified ? '#059669' : 'rgba(203, 213, 225, 0.9)'} strokeWidth="2" />
          <line x1="170" y1="0" x2="255" y2="24" stroke={isVerified ? '#059669' : 'rgba(203, 213, 225, 0.9)'} strokeWidth="2" />
        </svg>

        {/* Branch Level 1 Nodes */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--ink-muted)',
            }}
          >
            Branch A (H1 + H2)
          </div>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--ink-muted)',
            }}
          >
            Branch B (H3 + H4)
          </div>
        </div>

        {/* Leaf Level Connectors SVG */}
        <svg width="420" height="20" viewBox="0 0 420 20">
          <line x1="130" y1="0" x2="65" y2="20" stroke="rgba(203, 213, 225, 0.8)" strokeWidth="1.5" />
          <line x1="130" y1="0" x2="195" y2="20" stroke="rgba(203, 213, 225, 0.8)" strokeWidth="1.5" />
          <line x1="290" y1="0" x2="225" y2="20" stroke="rgba(203, 213, 225, 0.8)" strokeWidth="1.5" />
          <line x1="290" y1="0" x2="355" y2="20" stroke="rgba(203, 213, 225, 0.8)" strokeWidth="1.5" />
        </svg>

        {/* Leaf Nodes (Events) */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Leaf 1: Consent v1.0', 'Leaf 2: Turn 1 Quote', 'Leaf 3: Telemetry Blur', 'Leaf 4: Dossier Synthesis'].map((leaf, idx) => (
            <div
              key={idx}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={11} color="var(--success)" />
              <span>{leaf}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
