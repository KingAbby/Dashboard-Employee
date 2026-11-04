import { cn } from '../../lib/cn';
import { initials } from '../../lib/format';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-[13px]',
} as const;

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-tint font-bold text-primary-strong ring-1 ring-primary/15',
        SIZES[size],
        className,
      )}
    >
      {initials(name) || '?'}
    </span>
  );
}
