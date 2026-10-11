'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAtmosphere } from '@/context/AtmosphereContext';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface GridDot {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const InteractiveAtmosphere: React.FC = () => {
  const {
    preset,
    motionSpeed,
    dotInteractionEnabled,
    dotDisplacementForce,
    cardTiltEnabled,
    clickWaveEnabled,
  } = useAtmosphere();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<GridDot[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const animFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  // Click shockwave ripples
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const rippleCounter = useRef(0);

  // Initialize and resize interactive dots grid
  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    const gap = 30; // 30px grid spacing
    const cols = Math.ceil(width / gap) + 1;
    const rows = Math.ceil(height / gap) + 1;
    const newDots: GridDot[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * gap;
        const oy = r * gap;
        newDots.push({
          originX: ox,
          originY: oy,
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
        });
      }
    }
    dotsRef.current = newDots;
  }, []);

  // Animation render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    const mouse = mouseRef.current;
    const radius = 135; // Interaction radius in pixels
    const maxRepel = 24 * dotDisplacementForce;
    let maxMovement = 0;

    // Palette per preset
    const isDark = preset === 'obsidian';
    const baseColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(148, 163, 184, 0.32)';
    const activeColor =
      preset === 'matrix'
        ? 'rgba(13, 148, 136, 0.70)'
        : preset === 'emerald'
        ? 'rgba(16, 185, 129, 0.70)'
        : isDark
        ? 'rgba(129, 140, 248, 0.80)'
        : 'rgba(99, 102, 241, 0.65)';

    const dots = dotsRef.current;
    const len = dots.length;

    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      let targetX = dot.originX;
      let targetY = dot.originY;
      let isNearMouse = false;

      if (dotInteractionEnabled && mouse.active) {
        const dx = dot.originX - mouse.x;
        const dy = dot.originY - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = radius * radius;

        if (distSq < radiusSq && distSq > 0.001) {
          isNearMouse = true;
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / radius) * maxRepel;
          const angle = Math.atan2(dy, dx);
          targetX = dot.originX + Math.cos(angle) * force;
          targetY = dot.originY + Math.sin(angle) * force;
        }
      }

      // Spring physics
      dot.vx += (targetX - dot.x) * 0.15;
      dot.vy += (targetY - dot.y) * 0.15;
      dot.vx *= 0.76;
      dot.vy *= 0.76;
      dot.x += dot.vx;
      dot.y += dot.vy;

      const movement = Math.abs(dot.vx) + Math.abs(dot.vy);
      if (movement > maxMovement) maxMovement = movement;

      // Draw dot
      ctx.beginPath();
      if (isNearMouse) {
        ctx.fillStyle = activeColor;
        ctx.arc(dot.x, dot.y, 1.6, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = baseColor;
        ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Keep loop active while mouse is active or dots are settling
    if (mouse.active || maxMovement > 0.01) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      isRunningRef.current = false;
    }
  }, [dotInteractionEnabled, dotDisplacementForce, preset]);

  const wakeLoop = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [render]);

  // Pointer move updates mouse target and wakes canvas loop
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Touch devices skip repulsion for performance
      if (e.pointerType === 'touch') return;

      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      wakeLoop();
    },
    [wakeLoop]
  );

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.active = false;
    wakeLoop();
  }, [wakeLoop]);

  // Handle window resize
  useEffect(() => {
    initGrid();
    wakeLoop();

    const onResize = () => {
      initGrid();
      wakeLoop();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [initGrid, wakeLoop]);

  // Quantum click shockwave
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!clickWaveEnabled) return;
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      const id = ++rippleCounter.current;
      const newRipple: ClickRipple = { id, x: e.clientX, y: e.clientY };

      setRipples((prev) => [...prev.slice(-4), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 450);
    },
    [clickWaveEnabled]
  );

  // Global 3D Card Tilt with Specular Glare
  useEffect(() => {
    if (!cardTiltEnabled) return;

    const cards = document.querySelectorAll<HTMLElement>(
      '.glass-card-pro, .card-interactive, [data-tilt]'
    );
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      let isHovered = false;

      const onMove = (e: MouseEvent) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;

        const glareX = ((x / rect.width) * 100).toFixed(1);
        const glareY = ((y / rect.height) * 100).toFixed(1);
        card.style.setProperty('--glare-x', `${glareX}%`);
        card.style.setProperty('--glare-y', `${glareY}%`);
      };

      const onEnter = () => {
        isHovered = true;
        card.style.transition = 'transform 80ms ease-out, box-shadow 150ms ease';
      };

      const onLeave = () => {
        isHovered = false;
        card.style.transition =
          'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease';
        card.style.transform =
          'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        card.style.transform = '';
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [cardTiltEnabled]);

  // Global listeners
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handlePointerMove, handlePointerLeave, handlePointerDown]);

  return (
    <>
      {/* Precision Micro-Grid Canvas & Soft Deep Nebula Background */}
      <div className={`nebula-canvas-root preset-${preset}`} aria-hidden="true">
        {/* Soft, light-opacity floating chromatic orbs */}
        <div className="nebula-orb nebula-orb-1" />
        <div className="nebula-orb nebula-orb-2" />
        <div className="nebula-orb nebula-orb-3" />
        <div className="nebula-orb nebula-orb-4" />

        {/* Interactive Background Particle Dot-Matrix Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Subtle Horizon Vignette */}
        <div className="nebula-vignette" />
      </div>

      {/* Quantum Click Shockwave Rings */}
      {clickWaveEnabled && ripples.length > 0 && (
        <div className="quantum-shockwave-layer" aria-hidden="true">
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="quantum-shockwave-pulse"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};
