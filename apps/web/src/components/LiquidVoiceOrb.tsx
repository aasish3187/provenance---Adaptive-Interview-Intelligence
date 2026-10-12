'use client';

import React, { useRef, useEffect } from 'react';

interface LiquidVoiceOrbProps {
  isSpeaking: boolean;
  speaker: 'ai' | 'candidate' | 'idle';
  audioLevel?: number; // 0 to 1
}

export const LiquidVoiceOrb: React.FC<LiquidVoiceOrbProps> = ({
  isSpeaking,
  speaker,
  audioLevel = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = 55;

      ctx.clearRect(0, 0, width, height);

      phaseRef.current += isSpeaking ? 0.08 : 0.025;

      // Outer glow flare
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 2);
      if (speaker === 'ai') {
        glowGrad.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
        glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else if (speaker === 'candidate') {
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        glowGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(148, 163, 184, 0.20)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Deforming 3D liquid perimeter
      const points = 36;
      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const deformFactor = isSpeaking ? audioLevel * 14 : 3;
        const wave1 = Math.sin(theta * 3 + phaseRef.current) * deformFactor;
        const wave2 = Math.cos(theta * 5 - phaseRef.current * 1.4) * (deformFactor * 0.6);
        const r = baseRadius + wave1 + wave2;

        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Fluid orb internal shader gradient
      const orbGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.3,
        cy - baseRadius * 0.3,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius * 1.2
      );

      if (speaker === 'ai') {
        orbGrad.addColorStop(0, '#FFFFFF');
        orbGrad.addColorStop(0.3, '#818CF8'); // Indigo light
        orbGrad.addColorStop(0.7, '#4F46E5'); // Royal Indigo
        orbGrad.addColorStop(1, '#06B6D4'); // Cyan refraction
      } else if (speaker === 'candidate') {
        orbGrad.addColorStop(0, '#FFFFFF');
        orbGrad.addColorStop(0.3, '#34D399'); // Emerald light
        orbGrad.addColorStop(0.7, '#059669'); // Dark Emerald
        orbGrad.addColorStop(1, '#0284C7'); // Sky refraction
      } else {
        orbGrad.addColorStop(0, '#FFFFFF');
        orbGrad.addColorStop(0.5, '#CBD5E1');
        orbGrad.addColorStop(1, '#94A3B8');
      }

      ctx.fillStyle = orbGrad;
      ctx.shadowColor = speaker === 'ai' ? 'rgba(79, 70, 229, 0.6)' : 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Specular rim light ring
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, speaker, audioLevel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <canvas
        ref={canvasRef}
        width={180}
        height={180}
        style={{ width: '180px', height: '180px', display: 'block' }}
      />
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: speaker === 'ai' ? 'var(--accent)' : speaker === 'candidate' ? 'var(--success)' : 'var(--ink-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: '0 0 6px currentColor',
          }}
        />
        <span>{speaker === 'ai' ? 'Gemini Live Speaking' : speaker === 'candidate' ? 'Listening to Candidate' : 'Standing By'}</span>
      </div>
    </div>
  );
};
