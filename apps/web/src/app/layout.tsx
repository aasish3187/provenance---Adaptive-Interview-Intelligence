import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Provenance — Evidence-Driven Adaptive Interview Platform',
  description: 'Quiet intelligence. Proof at every click. An evidence-driven adaptive interview platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 🌌 Precision Micro-Grid & Drifting Nebula (Linear / Stripe Style — 100% Pure CSS, 0ms CPU Overhead) */}
        <div className="nebula-canvas-root" aria-hidden="true">
          <div className="nebula-orb nebula-orb-1" />
          <div className="nebula-orb nebula-orb-2" />
          <div className="nebula-orb nebula-orb-3" />
          <div className="nebula-orb nebula-orb-4" />
          <div className="nebula-grid-pattern" />
          <div className="nebula-vignette" />
        </div>
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

