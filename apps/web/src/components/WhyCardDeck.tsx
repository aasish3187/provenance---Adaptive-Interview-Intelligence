'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, ArrowRight, Zap, Target } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';

export const WhyCardDeck: React.FC = () => {
  const { scenario, playCrystalSound } = useScenario();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playCrystalSound('click');
  };

  return (
    <div
      onClick={handleFlip}
      className="glass-card-pro"
      title="Click to flip WhyCard and inspect underlying Information Gain utility math"
      style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.90)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.08), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        transform: isFlipped ? 'rotateX(4deg)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={14} />
          </div>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: 'var(--accent)' }}>
              Next-Best-Question WhyCard
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', display: 'block' }}>
              {scenario.whyCard.competency}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
            }}
          >
            {scenario.whyCard.bloom}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              color: 'var(--success)',
            }}
          >
            U = {scenario.whyCard.utilityScore.toFixed(2)}
          </span>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'var(--ink-muted)' }}>
        <strong>Trigger:</strong> {scenario.whyCard.trigger}
      </p>

      <div
        style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--ink-soft)',
        }}
      >
        <span>Mode: <strong style={{ color: 'var(--ink)' }}>{scenario.whyCard.decisionMode}</strong></span>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Click to toggle formula breakdown ↺</span>
      </div>
    </div>
  );
};
