'use client';

import React from 'react';

export interface ProvenanceLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: number;
  className?: string;
  subtitle?: string;
}

export const ProvenanceLogo: React.FC<ProvenanceLogoProps> = ({
  size = 32,
  showWordmark = true,
  wordmarkSize = 16,
  className = '',
  subtitle,
}) => {
  return (
    <div
      className={`provenance-celestial-brand-mark ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(8, Math.round(size * 0.28))}px`,
        userSelect: 'none',
      }}
    >
      {/* Precision Vector SVG of the Celestial Provenance Mark: Obelisk, North Star, Orbit & Voice */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Crystalline Obelisk Gradient */}
            <linearGradient id="celestial-obelisk" x1="16" y1="4" x2="22" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#A5F3FC" />
              <stop offset="60%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>

            {/* Facet Light Refraction */}
            <linearGradient id="celestial-facet" x1="10" y1="4" x2="26" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
            </linearGradient>

            {/* Loop & Celestial Orbit Gradient */}
            <linearGradient id="celestial-orbit" x1="12" y1="8" x2="44" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#A855F7" />
              <stop offset="85%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Acoustic Voice Waveform Gradient */}
            <linearGradient id="celestial-voice" x1="22" y1="14" x2="38" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.4" />
            </linearGradient>

            {/* The Golden North Star Gradient */}
            <linearGradient id="celestial-star" x1="26" y1="15" x2="32" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FEF08A" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Subtle Star Glow */}
            <filter id="celestial-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Celestial Orbital Ring (Lower/Back Arc - Tilted 26deg) */}
          <ellipse
            cx="27"
            cy="24"
            rx="18"
            ry="7.5"
            transform="rotate(-26 27 24)"
            stroke="url(#celestial-orbit)"
            strokeWidth="1.8"
            strokeDasharray="28 4 12 4"
            fill="none"
            opacity="0.85"
          />

          {/* 2. The Harmonic Voice Ribbons (Spoken Interview Waves inside the eye of 'P') */}
          <path
            d="M23 19 C25 17.5 27 18 29 20 C31 22 33 22.5 35 21"
            stroke="url(#celestial-voice)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M23 22 C25 20.5 27 21 29 23 C31 25 33 25.5 35 24"
            stroke="url(#celestial-voice)"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* 3. The P-Loop Arc (The Beta Posterior Curve) */}
          <path
            d="M21 9.5 H30 C36.2 9.5 41 14.3 41 20.5 C41 26.7 36.2 31.5 30 31.5 H21"
            stroke="url(#celestial-orbit)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. The Golden North Star (The Candidate's Dream & Career Destiny) */}
          <g transform="translate(30, 20.5)" filter="url(#celestial-glow)">
            {/* 8-pointed star */}
            <polygon
              points="0,-6 1.4,-1.4 6,0 1.4,1.4 0,6 -1.4,1.4 -6,0 -1.4,-1.4"
              fill="url(#celestial-star)"
            />
            {/* Diagonal twinkle points */}
            <polygon
              points="0,-4 0.9,-0.9 4,0 0.9,0.9 0,4 -0.9,0.9 -4,0 -0.9,-0.9"
              fill="#FFFFFF"
              transform="rotate(45)"
              opacity="0.85"
            />
            {/* Center stellar spark */}
            <circle cx="0" cy="0" r="1.1" fill="#FFFFFF" />
          </g>

          {/* 5. Crystalline Obelisk Vertical Spine (Grounded Truth & Role Architecture) */}
          {/* Main Obelisk Body */}
          <polygon
            points="15,44 19,44 19,10 17,4.5 15,10"
            fill="url(#celestial-obelisk)"
          />

          {/* Faceted Light Bevel (Left Refraction) */}
          <polygon
            points="15,44 17,44 17,4.5 15,10"
            fill="url(#celestial-facet)"
          />

          {/* Faceted Pyramid Crown (Apex) */}
          <polygon
            points="17,4.5 19,10 15,10"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Immutable Pedestal / Base Footing */}
          <polygon
            points="11,46 23,46 20,43 14,43"
            fill="url(#celestial-obelisk)"
          />
          <polygon
            points="11,46 17,46 17,43 14,43"
            fill="#FFFFFF"
            opacity="0.5"
          />

          {/* 6. Orbital Ring Forefront Overlap (Passes in front of lower spine for 3D depth) */}
          <path
            d="M11 29.5 C15 32 21 33.5 28 33 C34 32.5 39 30 42 27"
            stroke="url(#celestial-orbit)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontSize: `${wordmarkSize}px`,
              fontWeight: 800,
              color: 'var(--ink-strong)',
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            }}
          >
            provenance
          </span>
          {subtitle && (
            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
