'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CandidateDossierView } from '@/components/CandidateDossierView';

export default function CandidateReadinessReportPage() {
  const params = useParams();
  const interviewId = (params?.id as string) || 'INT-26E4FC';
  return <CandidateDossierView initialInterviewId={interviewId} />;
}
