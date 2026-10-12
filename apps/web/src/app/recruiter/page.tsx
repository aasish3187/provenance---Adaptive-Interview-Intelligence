'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecruiterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: 'var(--ink-muted)',
        fontSize: '14px',
      }}
    >
      Redirecting to Provenance Unified Workspace...
    </div>
  );
}
