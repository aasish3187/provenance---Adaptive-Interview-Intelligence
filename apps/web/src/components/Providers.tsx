'use client';

import React from 'react';
import { ScenarioProvider } from '@/context/ScenarioContext';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScenarioProvider>{children}</ScenarioProvider>
    </AuthProvider>
  );
}

