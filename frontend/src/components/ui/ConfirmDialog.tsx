import { Button } from './Button';
import { Modal } from './Modal';
import { AlertIcon } from './icons';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  loading = false,
  tone = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={
            tone === 'danger'
              ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger'
              : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary'
          }
        >
          <AlertIcon size={18} />
        </span>
        <p className="text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
    </Modal>
  );
}
