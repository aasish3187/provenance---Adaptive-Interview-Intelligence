'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface Dot {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const HighStitchBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({
    targetX: -9999,
    targetY: -9999,
    currentX: -9999,
    currentY: -9999,
    active: false,
  });
  const animFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  // Initialize dot matrix grid
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

    const gap = 26; // High-precision 26px grid spacing
    const cols = Math.ceil(width / gap) + 1;
    const rows = Math.ceil(height / gap) + 1;
    const newDots: Dot[] = [];

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

  // Main render animation loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    const mouse = mouseRef.current;

    // Smooth Lerp interpolation for mouse position
    if (mouse.active) {
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.18;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.18;
    }

    // 1. Draw whisper-soft ambient tracking light bloom strictly in the deep background
    if (mouse.active && mouse.currentX > -500) {
      const gradient = ctx.createRadialGradient(
        mouse.currentX,
        mouse.currentY,
        0,
        mouse.currentX,
        mouse.currentY,
        280
      );
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.09)'); // Soft Electric Indigo
      gradient.addColorStop(0.4, 'rgba(6, 182, 212, 0.05)'); // Soft Cyan
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.currentX, mouse.currentY, 280, 0, Math.PI * 2);
      ctx.fill();
    }

    const radius = 135; // Interactive displacement radius
    const maxRepel = 20; // Max displacement force in pixels
    let maxMovement = 0;
    const dots = dotsRef.current;
    const len = dots.length;

    // 2. Calculate spring physics and collect active near-mouse dots
    const nearIndices: number[] = [];

    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      let targetX = dot.originX;
      let targetY = dot.originY;

      if (mouse.active) {
        const dx = dot.originX - mouse.currentX;
        const dy = dot.originY - mouse.currentY;
        const distSq = dx * dx + dy * dy;

        if (distSq < radius * radius && distSq > 0.001) {
          nearIndices.push(i);
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / radius) * maxRepel;
          const angle = Math.atan2(dy, dx);
          targetX = dot.originX + Math.cos(angle) * force;
          targetY = dot.originY + Math.sin(angle) * force;
        }
      }

      // Smooth elastic spring damping
      dot.vx += (targetX - dot.x) * 0.14;
      dot.vy += (targetY - dot.y) * 0.14;
      dot.vx *= 0.78;
      dot.vy *= 0.78;
      dot.x += dot.vx;
      dot.y += dot.vy;

      const movement = Math.abs(dot.vx) + Math.abs(dot.vy);
      if (movement > maxMovement) maxMovement = movement;
    }

    // 3. Draw faint architectural constellation filaments between nearby active dots
    if (nearIndices.length > 1) {
      ctx.lineWidth = 0.8;
      for (let j = 0; j < nearIndices.length; j++) {
        const dotA = dots[nearIndices[j]];
        for (let k = j + 1; k < nearIndices.length; k++) {
          const dotB = dots[nearIndices[k]];
          const distBetween = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);
          if (distBetween < 42) {
            const alpha = (1 - distBetween / 42) * 0.16;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(dotA.x, dotA.y);
            ctx.lineTo(dotB.x, dotB.y);
            ctx.stroke();
          }
        }
      }
    }

    // 4. Draw dots with specular contrast
    for (let i = 0; i < len; i++) {
      const dot = dots[i];
      const isNear = nearIndices.includes(i);

      ctx.beginPath();
      if (isNear) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.65)';
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
        ctx.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Continue loop if pointer is active or dots are settling
    if (mouse.active || maxMovement > 0.01) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      isRunningRef.current = false;
    }
  }, []);

  const wakeLoop = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [render]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Touch devices skip pointer physics for performance
      if (e.pointerType === 'touch') return;

      const mouse = mouseRef.current;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      if (!mouse.active) {
        mouse.currentX = e.clientX;
        mouse.currentY = e.clientY;
        mouse.active = true;
      }

      wakeLoop();
    },
    [wakeLoop]
  );

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.active = false;
    wakeLoop();
  }, [wakeLoop]);

  // Handle window lifecycle
  useEffect(() => {
    initGrid();
    wakeLoop();

    const onResize = () => {
      initGrid();
      wakeLoop();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initGrid, wakeLoop, handlePointerMove, handlePointerLeave]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1, // Strictly inside nebula-canvas-root (z-index 0)
      }}
    />
  );
};
