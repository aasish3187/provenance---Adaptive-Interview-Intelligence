'use client';

import React, { useRef, useEffect } from 'react';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

export const PresenceRadarHUD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepAngleRef = useRef(0);

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
      const radius = width / 2 - 4;

      ctx.clearRect(0, 0, width, height);
      sweepAngleRef.current += 0.04;

      // Outer radar circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Radar Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.15)';
      ctx.stroke();

      // Sweeping beam
      const beamX = cx + Math.cos(sweepAngleRef.current) * radius;
      const beamY = cy + Math.sin(sweepAngleRef.current) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(beamX, beamY);
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.8)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Detected face blip (center-locked)
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.shadowColor = 'rgba(5, 150, 105, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(5, 150, 105, 0.25)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(5, 150, 105, 0.06)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={40}
        height={40}
        style={{ width: '40px', height: '40px', display: 'block', flexShrink: 0 }}
      />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>
          <Lock size={12} />
          <span>ON-DEVICE PRESENCE RADAR</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
          1 Face Count Detected · Zero Raw Video Transmitted
        </div>
      </div>
    </div>
  );
};
