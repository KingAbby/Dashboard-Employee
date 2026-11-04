import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './icons';
import { ToastContext, type ToastContextValue, type ToastTone } from './toast-context';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

const TONE_STYLES: Record<ToastTone, { wrap: string; icon: ReactNode }> = {
  success: {
    wrap: 'border-success/25 bg-white text-ink',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-tint text-success">
        <CheckIcon size={13} />
      </span>
    ),
  },
  error: {
    wrap: 'border-danger/25 bg-white text-ink',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-tint text-danger">
        <AlertIcon size={13} />
      </span>
    ),
  },
  info: {
    wrap: 'border-info/25 bg-white text-ink',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info-tint text-info">
        <InfoIcon size={13} />
      </span>
    ),
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      counter.current += 1;
      const id = counter.current;
      setItems((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-card border px-3.5 py-3 shadow-[0_10px_30px_rgba(26,26,26,0.12)]',
              TONE_STYLES[item.tone].wrap,
            )}
          >
            {TONE_STYLES[item.tone].icon}
            <p className="flex-1 text-[12.5px] leading-relaxed">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Tutup notifikasi"
              className="rounded p-0.5 text-subtle transition-colors hover:text-ink"
            >
              <CloseIcon size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
