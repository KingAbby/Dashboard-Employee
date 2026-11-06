import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { FieldProps } from './Input';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  children: ReactNode;
}

export function Select({
  label,
  hint,
  error,
  required,
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={selectId} className="label-caps text-muted">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn('input-base h-10 appearance-none pr-9', error && 'input-error')}
          {...rest}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-[11px] text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
