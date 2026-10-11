'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';

interface ConfidenceSloshGaugeProps {
  value?: number; // 0 to 100
}

export const ConfidenceSloshGauge: React.FC<ConfidenceSloshGaugeProps> = ({ value = 94 }) => {
  const { playCrystalSound } = useScenario();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sloshEnergy, setSloshEnergy] = useState(1);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const radius = width / 2 - 4;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      phaseRef.current += 0.05 * sloshEnergy;

      // Draw outer circle clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Liquid base fill
      const targetHeight = cy + radius - (2 * radius * (value / 100));
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, targetHeight);

      // Liquid wave surface
      for (let x = 0; x <= width; x += 4) {
        const wave = Math.sin(phaseRef.current + (x / 20)) * (4 * sloshEnergy);
        ctx.lineTo(x, targetHeight + wave);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const liquidGrad = ctx.createLinearGradient(0, targetHeight, 0, height);
      liquidGrad.addColorStop(0, 'rgba(79, 70, 229, 0.45)');
      liquidGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      liquidGrad.addColorStop(1, 'rgba(16, 185, 129, 0.30)');
      ctx.fillStyle = liquidGrad;
      ctx.fill();

      // Specular surface highlight
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.stroke();

      ctx.restore();

      // Outer glass rim ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(79, 70, 229, 0.15)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [value, sloshEnergy]);

  const handleSlosh = () => {
    setSloshEnergy(2.4);
    playCrystalSound('click');
    setTimeout(() => setSloshEnergy(1), 1200);
  };

  return (
    <div
      onClick={handleSlosh}
      title="Click to agitate liquid confidence calibration"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', width: '54px', height: '54px', flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={54}
          height={54}
          style={{ width: '54px', height: '54px', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--ink)',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          }}
        >
          {value}%
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: 'var(--accent)' }}>
          Evidence Calibrated
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
          Exact Substring Grounding
        </div>
      </div>
    </div>
  );
};
