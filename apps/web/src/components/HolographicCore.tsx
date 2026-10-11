'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Compass, Eye, ShieldCheck, Zap } from 'lucide-react';
import { useScenario } from '@/context/ScenarioContext';



interface Point3D {

  x: number;
  y: number;
  z: number;
}

// 3D Icosahedron vertices definition
const PHI = (1 + Math.sqrt(5)) / 2;
const BASE_VERTICES: Point3D[] = [
  { x: -1, y: PHI, z: 0 },
  { x: 1, y: PHI, z: 0 },
  { x: -1, y: -PHI, z: 0 },
  { x: 1, y: -PHI, z: 0 },
  { x: 0, y: -1, z: PHI },
  { x: 0, y: 1, z: PHI },
  { x: 0, y: -1, z: -PHI },
  { x: 0, y: 1, z: -PHI },
  { x: PHI, y: 0, z: -1 },
  { x: PHI, y: 0, z: 1 },
  { x: -PHI, y: 0, z: -1 },
  { x: -PHI, y: 0, z: 1 },
];

// Normalize vertices to unit sphere
const VERTICES = BASE_VERTICES.map((v) => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
});

const EDGES: [number, number][] = [
  [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
  [1, 5], [1, 9], [1, 8], [1, 7],
  [2, 11], [2, 4], [2, 3], [2, 6], [2, 10],
  [3, 4], [3, 9], [3, 8], [3, 6],
  [4, 5], [4, 9], [4, 11],
  [5, 9], [5, 11],
  [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10],
  [8, 9],
  [10, 11],
];

export interface HolographicCoreProps {
  coverage?: number;
  currentTurn?: number;
  bloomLevel?: number;
  label?: string;
}

export const HolographicCore: React.FC<HolographicCoreProps> = ({
  coverage,
  currentTurn,
  bloomLevel,
  label,
}) => {
  const { scenario } = useScenario();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const displayCoverage = coverage ?? scenario.coverage;
  const displayTurn = currentTurn ?? scenario.currentTurn;
  const displayBloom = bloomLevel ?? scenario.bloomLevel;

  const [isInteracting, setIsInteracting] = useState(false);
  const rotRef = useRef({ x: 0.3, y: 0.4, vx: 0.005, vy: 0.008 });
  const mouseRef = useRef({ isDown: false, lastX: 0, lastY: 0 });

  // Floating internal competency particles
  const particlesRef = useRef(
    Array.from({ length: 28 }, () => ({
      x: (Math.random() - 0.5) * 0.9,
      y: (Math.random() - 0.5) * 0.9,
      z: (Math.random() - 0.5) * 0.9,
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      vz: (Math.random() - 0.5) * 0.003,
      size: Math.random() * 2 + 1.2,
      hue: Math.random() > 0.5 ? 240 : 160, // Indigo or Emerald
    }))
  );

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
      const radius = Math.min(width, height) * 0.34;

      ctx.clearRect(0, 0, width, height);

      // Natural continuous rotation + velocity decay if dragging stopped
      if (!mouseRef.current.isDown) {
        rotRef.current.x += rotRef.current.vx;
        rotRef.current.y += rotRef.current.vy;
        rotRef.current.vx *= 0.98;
        rotRef.current.vy *= 0.98;
        // Keep minimum resting spin
        if (Math.abs(rotRef.current.vx) < 0.003) rotRef.current.vx = 0.003;
        if (Math.abs(rotRef.current.vy) < 0.005) rotRef.current.vy = 0.005;
      }

      const rx = rotRef.current.x;
      const ry = rotRef.current.y;

      // 3D rotation transform function
      const project = (p: Point3D) => {
        // Rotate around Y
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 3.2;
        const scale = fov / (fov + z2);
        return {
          px: cx + x1 * radius * scale,
          py: cy + y2 * radius * scale,
          z: z2,
          scale,
        };
      };

      // Draw subtle ambient glow behind crystal
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
      grad.addColorStop(0, 'rgba(79, 70, 229, 0.16)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render internal particle cloud
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;
        if (Math.abs(pt.x) > 0.45) pt.vx *= -1;
        if (Math.abs(pt.y) > 0.45) pt.vy *= -1;
        if (Math.abs(pt.z) > 0.45) pt.vz *= -1;

        const pr = project(pt);
        const alpha = Math.max(0.15, (pr.z + 1.2) / 2.4);
        ctx.beginPath();
        ctx.arc(pr.px, pr.py, pt.size * pr.scale, 0, Math.PI * 2);
        ctx.fillStyle = pt.hue === 240 ? `rgba(99, 102, 241, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
        ctx.shadowColor = pt.hue === 240 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(16, 185, 129, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Project vertices
      const projected = VERTICES.map(project);

      // Render crystal wireframe edges
      ctx.lineWidth = isHovered ? 1.8 : 1.2;
      EDGES.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.z + p2.z) / 2;
        const edgeAlpha = Math.max(0.12, (avgZ + 1.0) / 2.0);

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = `rgba(79, 70, 229, ${edgeAlpha * 0.75})`;
        ctx.stroke();
      });

      // Render vertex gemstone nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.3, (p.z + 1.2) / 2.4);
        ctx.beginPath();
        ctx.arc(p.px, p.py, 3.2 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
    setIsInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseRef.current.isDown) return;
    const dx = e.clientX - mouseRef.current.lastX;
    const dy = e.clientY - mouseRef.current.lastY;
    rotRef.current.vy = dx * 0.008;
    rotRef.current.vx = -dy * 0.008;
    rotRef.current.y += rotRef.current.vy;
    rotRef.current.x += rotRef.current.vx;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
    setIsInteracting(false);
  };

  return (
    <div
      className="glass-card-pro"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUp();
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '220px',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={15} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              3D Intelligence Core
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block' }}>
              {scenario.candidateName.split(' ')[0]} ({scenario.roleTitle}) · Gyroscope
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '3px 8px',
            backgroundColor: isInteracting ? 'rgba(79, 70, 229, 0.12)' : 'rgba(5, 150, 105, 0.10)',
            border: isInteracting ? '1px solid var(--accent)' : '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            color: isInteracting ? 'var(--accent)' : 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isInteracting ? 'var(--accent)' : 'var(--success)',
            }}
          />
          <span>{isInteracting ? 'Active Spin' : 'Spatial Synced'}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={340}
        height={180}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor: isInteracting ? 'grabbing' : 'grab',
          maxWidth: '100%',
          touchAction: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--ink-muted)',
          marginTop: '2px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          zIndex: 10,
        }}
      >
        <span>{displayCoverage}% Calibrated Coverage · Turn {displayTurn}</span>
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Target Bloom: L{displayBloom}</span>
      </div>
    </div>
  );
};

