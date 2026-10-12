'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle, Shield, AlertTriangle } from 'lucide-react';

export type StatusType =
  | 'Verified'
  | 'Claimed — needs validation'
  | 'Tested — not demonstrated'
  | 'Not assessed'
  | 'Priority: None'
  | 'Priority: Low'
  | 'Priority: Moderate'
  | 'Priority: High';

interface StatusTagProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'md' }) => {
  let bgColor = 'var(--surface-subtle)';
  let textColor = 'var(--ink-muted)';
  let icon = <HelpCircle size={size === 'sm' ? 12 : 14} />;

  switch (status) {
    case 'Verified':
      bgColor = 'var(--success-soft)';
      textColor = 'var(--success)';
      icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Claimed — needs validation':
      bgColor = 'var(--warning-soft)';
      textColor = 'var(--warning)';
      icon = <AlertCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Tested — not demonstrated':
      bgColor = 'var(--danger-soft)';
      textColor = 'var(--danger)';
      icon = <XCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Not assessed':
      bgColor = 'var(--surface-subtle)';
      textColor = 'var(--ink-muted)';
      icon = <HelpCircle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Priority: None':
      bgColor = 'var(--surface-subtle)';
      textColor = 'var(--ink-muted)';
      icon = <Shield size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Priority: Low':
      bgColor = 'var(--info-soft)';
      textColor = 'var(--info)';
      icon = <Shield size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Priority: Moderate':
      bgColor = 'var(--warning-soft)';
      textColor = 'var(--warning)';
      icon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
      break;
    case 'Priority: High':
      bgColor = 'var(--danger-soft)';
      textColor = 'var(--danger)';
      icon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
      break;
  }

  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: size === 'sm' ? '2px 6px' : '4px 10px',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: 'var(--radius-sm)',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
};
