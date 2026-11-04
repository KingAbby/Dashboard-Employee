import { useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { FieldProps } from './Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

export function Textarea({ label, hint, error, required, className, id, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={textareaId} className="label-caps text-muted">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn('input-base min-h-[84px] resize-y', error && 'input-error')}
        {...rest}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="text-[11px] text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
