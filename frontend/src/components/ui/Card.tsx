import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className, padded = true }: CardProps) {
  return <div className={cn('card-surface', padded && 'p-5', className)}>{children}</div>;
}

export interface CardHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ eyebrow, title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="label-caps text-subtle">{eyebrow}</p> : null}
        <h2 className="mt-0.5 text-[15px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[12px] text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
