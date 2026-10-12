'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateDossierView } from '@/components/CandidateDossierView';

function ReportsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session') || searchParams?.get('id') || 'INT-26E4FC';
  return <CandidateDossierView initialInterviewId={sessionId} />;
}

export default function RecruiterReportsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading Candidate Readiness Dossier...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
