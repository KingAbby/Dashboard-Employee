import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { BadgeTone } from './Badge';

const TONE_STYLES: Record<BadgeTone, { card: string; label: string; icon: string; value: string }> = {
  success: {
    card: 'bg-success-tint border-success/20',
    label: 'text-success',
    icon: 'text-success',
    value: 'text-ink',
  },
  warning: {
    card: 'bg-warning-tint border-warning/20',
    label: 'text-warning',
    icon: 'text-warning',
    value: 'text-ink',
  },
  info: {
    card: 'bg-info-tint border-info/20',
    label: 'text-info',
    icon: 'text-info',
    value: 'text-ink',
  },
  danger: {
    card: 'bg-danger-tint border-danger/20',
    label: 'text-danger',
    icon: 'text-danger',
    value: 'text-ink',
  },
  primary: {
    card: 'bg-primary-tint border-primary/25',
    label: 'text-primary',
    icon: 'text-primary',
    value: 'text-ink',
  },
  neutral: {
    card: 'bg-surface border-line',
    label: 'text-muted',
    icon: 'text-subtle',
    value: 'text-ink',
  },
};

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: BadgeTone;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
  loading = false,
  className,
}: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={cn('rounded-card border p-4', styles.card, className)}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn('label-caps', styles.label)}>{label}</p>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
      </div>

      {loading ? (
        <div className="mt-2.5 h-7 w-16 animate-pulse rounded bg-black/5" />
      ) : (
        <p className={cn('mt-1.5 text-[24px] font-bold leading-tight tracking-[-0.02em]', styles.value)}>
          {value}
        </p>
      )}

      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
