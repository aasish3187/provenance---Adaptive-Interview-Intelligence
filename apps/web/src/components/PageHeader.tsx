'use client';

import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  showBackButton = true,
  backHref = '/',
  primaryAction,
  secondaryActions,
  badge,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isOverview = pathname === '/' || pathname === '/recruiter';
  const shouldShowBack = showBackButton && !isOverview;

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Breadcrumbs & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        {shouldShowBack && (
          <button
            type="button"
            onClick={() => router.push(backHref || '/')}
            aria-label="Back to main page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              backgroundColor: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              transition: 'background-color 120ms ease',
            }}
          >
            <ArrowLeft size={12} />
            <span>Back</span>
          </button>
        )}

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumbs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontSize: '12px',
              color: 'var(--ink-soft)',
            }}
          >
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {(idx > 0 || shouldShowBack) && <ChevronRight size={12} />}
                {item.href ? (
                  <a href={item.href} style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--ink)' }}>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Main Title & Action Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--ink-strong)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {badge}
          </div>

          {description && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--ink-muted)',
                marginTop: 'var(--space-1)',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {secondaryActions}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--accent)',
                color: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
