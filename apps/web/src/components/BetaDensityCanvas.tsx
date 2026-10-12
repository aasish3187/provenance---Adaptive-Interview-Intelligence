'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';

import { useScenario, ScenarioId } from '@/context/ScenarioContext';


// Real Bayesian parameters for active benchmark scenarios
const SCENARIO_BETA_PARAMS: Record<ScenarioId, { alpha: number; beta: number; label: string }> = {
  G1: { alpha: 14.5, beta: 2.2, label: 'Aasish (Senior Distributed Systems)' },
  G3: { alpha: 3.6, beta: 6.4, label: 'Jordan Vance (Cloud Platform Architect)' },
  G5: { alpha: 6.8, beta: 4.2, label: 'Priya Nair (Principal Systems)' },
  G7: { alpha: 10.2, beta: 3.8, label: 'Elena Rostova (Staff SRE)' },
};

// Approximation of Log Beta function for PDF calculation
function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

// Stirling-Lanczos formula for Log Gamma
function logGamma(z: number): number {
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    ser += c[j] / ++y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betaPdf(x: number, a: number, b: number): number {
  if (x <= 0 || x >= 1) return 0;
  const lBeta = logBeta(a, b);
  const logVal = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lBeta;
  return Math.exp(logVal);
}

interface BetaDensityCanvasProps {
  initialAlpha?: number;
  initialBeta?: number;
  candidateName?: string;
}

export const BetaDensityCanvas: React.FC<BetaDensityCanvasProps> = ({
  initialAlpha,
  initialBeta,
  candidateName,
}) => {
  const { activeScenarioId, playCrystalSound } = useScenario();
  const defaultParams = SCENARIO_BETA_PARAMS[activeScenarioId] || SCENARIO_BETA_PARAMS.G1;

  const [alpha, setAlpha] = useState(initialAlpha ?? defaultParams.alpha);
  const [beta, setBeta] = useState(initialBeta ?? defaultParams.beta);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with active scenario changes
  useEffect(() => {
    if (initialAlpha === undefined && initialBeta === undefined) {
      const p = SCENARIO_BETA_PARAMS[activeScenarioId] || SCENARIO_BETA_PARAMS.G1;
      setAlpha(p.alpha);
      setBeta(p.beta);
    }
  }, [activeScenarioId, initialAlpha, initialBeta]);

  // Exact Bayesian posterior mean & uncertainty
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const uncertainty = Math.sqrt(variance);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 28;
    const padRight = 20;
    const padBottom = 26;
    const padTop = 18;
    const plotW = width - padLeft - padRight;
    const plotH = height - padBottom - padTop;

    // Find maximum PDF value for proper canvas scaling
    let maxPdf = 0;
    const steps = 140;
    for (let i = 1; i < steps; i++) {
      const xVal = i / steps;
      const yVal = betaPdf(xVal, alpha, beta);
      if (yVal > maxPdf && !isNaN(yVal) && isFinite(yVal)) maxPdf = yVal;
    }
    if (maxPdf === 0) maxPdf = 1;

    // Draw baseline
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, height - padBottom);
    ctx.lineTo(width - padRight, height - padBottom);
    ctx.stroke();

    // 1. Draw Credible Interval (Uncertainty Band) SHADED UNDER THE CURVE
    const uLow = Math.max(0.01, mean - uncertainty);
    const uHigh = Math.min(0.99, mean + uncertainty);
    const uLowPx = padLeft + uLow * plotW;
    const uHighPx = padLeft + uHigh * plotW;

    ctx.beginPath();
    ctx.moveTo(uLowPx, height - padBottom);
    for (let i = 1; i < steps; i++) {
      const xVal = i / steps;
      if (xVal >= uLow && xVal <= uHigh) {
        const yVal = Math.min(betaPdf(xVal, alpha, beta), maxPdf * 1.05);
        const px = padLeft + xVal * plotW;
        const py = height - padBottom - (yVal / maxPdf) * plotH;
        ctx.lineTo(px, py);
      }
    }
    ctx.lineTo(uHighPx, height - padBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(5, 150, 105, 0.16)'; // Emerald credible region
    ctx.fill();

    // 2. Draw full curve fill gradient
    ctx.beginPath();
    ctx.moveTo(padLeft, height - padBottom);
    const pts: { x: number; y: number }[] = [];

    for (let i = 1; i < steps; i++) {
      const xVal = i / steps;
      const yVal = Math.min(betaPdf(xVal, alpha, beta), maxPdf * 1.05);
      const px = padLeft + xVal * plotW;
      const py = height - padBottom - (yVal / maxPdf) * plotH;
      ctx.lineTo(px, py);
      pts.push({ x: px, y: py });
    }
    ctx.lineTo(width - padRight, height - padBottom);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    grad.addColorStop(0, 'rgba(79, 70, 229, 0.28)');
    grad.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Stroke the outer curve
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(79, 70, 229, 0.35)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. Mean Indicator Bead sitting precisely on the curve
    const meanPx = padLeft + mean * plotW;
    const meanPdf = betaPdf(mean, alpha, beta);
    const meanPy = height - padBottom - (meanPdf / maxPdf) * plotH;

    // Vertical dashed dropline from bead to baseline
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.6;
    ctx.moveTo(meanPx, meanPy);
    ctx.lineTo(meanPx, height - padBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glow bead on curve
    ctx.beginPath();
    ctx.arc(meanPx, meanPy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#059669';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px monospace';
    ctx.fillText('0.0', padLeft - 6, height - 8);
    ctx.fillText('0.5', padLeft + plotW * 0.5 - 8, height - 8);
    ctx.fillText('1.0', width - padRight - 8, height - 8);

    // Label on Mean
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`μ=${(mean * 100).toFixed(0)}%`, Math.max(padLeft, meanPx - 18), Math.max(12, meanPy - 7));
  }, [alpha, beta, mean, uncertainty]);

  const activeLabel = candidateName || defaultParams.label;

  return (
    <div
      className="glass-card-pro"
      style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.06), inset 0 1.5px 2px rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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
            <Activity size={15} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Live Beta Uncertainty Density Curve
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block' }}>
              {activeLabel} · P(θ | α={alpha.toFixed(1)}, β={beta.toFixed(1)})
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '4px 10px',
            backgroundColor: 'rgba(5, 150, 105, 0.10)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--success)',
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
              backgroundColor: 'var(--success)',
            }}
          />
          <span>Calibrated Posterior</span>
        </div>
      </div>


      <canvas
        ref={canvasRef}
        width={340}
        height={130}
        style={{ width: '100%', height: '130px', display: 'block' }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          fontSize: '11px',
        }}
      >
        <span style={{ color: 'var(--ink-muted)' }}>
          Posterior Mean: <strong style={{ color: '#059669', fontSize: '12px' }}>{(mean * 100).toFixed(1)}%</strong>
        </span>
        <span style={{ color: 'var(--ink-muted)' }}>
          Credible Uncertainty: <strong style={{ color: 'var(--accent)', fontSize: '12px' }}>±{(uncertainty * 100).toFixed(1)}%</strong>
        </span>
      </div>
    </div>
  );
};
