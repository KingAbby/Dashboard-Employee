import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'primary';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning',
  info: 'bg-info-tint text-info',
  danger: 'bg-danger-tint text-danger',
  neutral: 'bg-surface-muted text-muted',
  primary: 'bg-primary-tint text-primary-strong',
};

const DOTS: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
  neutral: 'bg-subtle',
  primary: 'bg-primary',
};

export interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot = false, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[tone])} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
