import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldProps {
  icon?: ReactNode;
  trailing?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  required,
  className,
  icon,
  trailing,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={inputId} className="label-caps text-muted">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
            {icon}
          </span>
        ) : null}

        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'input-base h-10',
            icon && 'pl-9',
            trailing && 'pr-10',
            error && 'input-error',
          )}
          {...rest}
        />

        {trailing ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[11px] text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
