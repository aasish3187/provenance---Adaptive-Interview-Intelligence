'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AtmospherePreset = 'nebula' | 'matrix' | 'obsidian' | 'emerald';
export type MotionSpeed = 'zen' | 'flow' | 'dynamic';

interface AtmosphereContextType {
  preset: AtmospherePreset;
  setPreset: (preset: AtmospherePreset) => void;
  motionSpeed: MotionSpeed;
  setMotionSpeed: (speed: MotionSpeed) => void;
  dotInteractionEnabled: boolean;
  setDotInteractionEnabled: (enabled: boolean) => void;
  dotDisplacementForce: number; // 0 to 1
  setDotDisplacementForce: (force: number) => void;
  cardTiltEnabled: boolean;
  setCardTiltEnabled: (enabled: boolean) => void;
  clickWaveEnabled: boolean;
  setClickWaveEnabled: (enabled: boolean) => void;
  resetDefaults: () => void;
}

const STORAGE_KEY = 'provenance_atmosphere_config';

const DEFAULT_CONFIG = {
  preset: 'nebula' as AtmospherePreset,
  motionSpeed: 'flow' as MotionSpeed,
  dotInteractionEnabled: true,
  dotDisplacementForce: 0.75,
  cardTiltEnabled: true,
  clickWaveEnabled: true,
};

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export const AtmosphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preset, setPresetState] = useState<AtmospherePreset>(DEFAULT_CONFIG.preset);
  const [motionSpeed, setMotionSpeedState] = useState<MotionSpeed>(DEFAULT_CONFIG.motionSpeed);
  const [dotInteractionEnabled, setDotInteractionEnabledState] = useState<boolean>(DEFAULT_CONFIG.dotInteractionEnabled);
  const [dotDisplacementForce, setDotDisplacementForceState] = useState<number>(DEFAULT_CONFIG.dotDisplacementForce);
  const [cardTiltEnabled, setCardTiltEnabledState] = useState<boolean>(DEFAULT_CONFIG.cardTiltEnabled);
  const [clickWaveEnabled, setClickWaveEnabledState] = useState<boolean>(DEFAULT_CONFIG.clickWaveEnabled);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.preset) setPresetState(parsed.preset);
        if (parsed.motionSpeed) setMotionSpeedState(parsed.motionSpeed);
        if (typeof parsed.dotInteractionEnabled === 'boolean') setDotInteractionEnabledState(parsed.dotInteractionEnabled);
        else if (typeof parsed.spotlightEnabled === 'boolean') setDotInteractionEnabledState(parsed.spotlightEnabled);
        if (typeof parsed.dotDisplacementForce === 'number') setDotDisplacementForceState(parsed.dotDisplacementForce);
        else if (typeof parsed.spotlightIntensity === 'number') setDotDisplacementForceState(parsed.spotlightIntensity);
        if (typeof parsed.cardTiltEnabled === 'boolean') setCardTiltEnabledState(parsed.cardTiltEnabled);
        if (typeof parsed.clickWaveEnabled === 'boolean') setClickWaveEnabledState(parsed.clickWaveEnabled);
      }
    } catch (_) {}
  }, []);

  // Save to localStorage when modified
  const saveConfig = (updated: Partial<typeof DEFAULT_CONFIG>) => {
    try {
      const current = {
        preset,
        motionSpeed,
        dotInteractionEnabled,
        dotDisplacementForce,
        cardTiltEnabled,
        clickWaveEnabled,
        ...updated,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (_) {}
  };

  const setPreset = (p: AtmospherePreset) => {
    setPresetState(p);
    saveConfig({ preset: p });
  };

  const setMotionSpeed = (s: MotionSpeed) => {
    setMotionSpeedState(s);
    saveConfig({ motionSpeed: s });
  };

  const setDotInteractionEnabled = (e: boolean) => {
    setDotInteractionEnabledState(e);
    saveConfig({ dotInteractionEnabled: e });
  };

  const setDotDisplacementForce = (f: number) => {
    setDotDisplacementForceState(f);
    saveConfig({ dotDisplacementForce: f });
  };

  const setCardTiltEnabled = (e: boolean) => {
    setCardTiltEnabledState(e);
    saveConfig({ cardTiltEnabled: e });
  };

  const setClickWaveEnabled = (e: boolean) => {
    setClickWaveEnabledState(e);
    saveConfig({ clickWaveEnabled: e });
  };

  const resetDefaults = () => {
    setPresetState(DEFAULT_CONFIG.preset);
    setMotionSpeedState(DEFAULT_CONFIG.motionSpeed);
    setDotInteractionEnabledState(DEFAULT_CONFIG.dotInteractionEnabled);
    setDotDisplacementForceState(DEFAULT_CONFIG.dotDisplacementForce);
    setCardTiltEnabledState(DEFAULT_CONFIG.cardTiltEnabled);
    setClickWaveEnabledState(DEFAULT_CONFIG.clickWaveEnabled);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  // Synchronize CSS attributes on root document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-atmosphere', preset);
      document.documentElement.setAttribute('data-motion-speed', motionSpeed);
      
      const speedMultiplier = motionSpeed === 'zen' ? '1.8' : motionSpeed === 'dynamic' ? '0.5' : '1.0';
      document.documentElement.style.setProperty('--nebula-speed-multiplier', speedMultiplier);
    }
  }, [preset, motionSpeed]);

  return (
    <AtmosphereContext.Provider
      value={{
        preset,
        setPreset,
        motionSpeed,
        setMotionSpeed,
        dotInteractionEnabled,
        setDotInteractionEnabled,
        dotDisplacementForce,
        setDotDisplacementForce,
        cardTiltEnabled,
        setCardTiltEnabled,
        clickWaveEnabled,
        setClickWaveEnabled,
        resetDefaults,
      }}
    >
      {children}
    </AtmosphereContext.Provider>
  );
};

export const useAtmosphere = () => {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  }
  return context;
};
