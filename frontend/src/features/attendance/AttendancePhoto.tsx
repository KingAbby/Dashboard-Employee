import { useEffect, useState } from 'react';
import { fetchAttendancePhoto } from '../../features/attendance/api';
import type { AttendancePhotoType } from '../../types/api';
import { cn } from '../../lib/cn';
import { AlertIcon } from '../../components/ui/icons';

export interface AttendancePhotoProps {
  attendanceId: string;
  type: AttendancePhotoType;
  alt: string;
  className?: string;
  missingLabel?: string;
  hasPhoto?: boolean;
}

const LABEL_FALLBACK: Record<AttendancePhotoType, string> = {
  in: 'Foto absen masuk',
  out: 'Foto absen pulang',
};

export function AttendancePhoto({
  attendanceId,
  type,
  alt,
  className,
  missingLabel,
  hasPhoto = true,
}: AttendancePhotoProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasPhoto) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    fetchAttendancePhoto(attendanceId, type)
      .then((nextUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        objectUrl = nextUrl;
        setUrl(nextUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attendanceId, type, hasPhoto]);

  if (!hasPhoto) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-card border border-dashed border-line bg-bg/60 px-4 text-center">
        <p className="text-[12px] text-subtle">{missingLabel ?? 'Tidak ada foto.'}</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-[220px] items-center gap-2 rounded-card border border-danger/25 bg-danger-tint px-3 py-3">
        <span className="text-danger">
          <AlertIcon size={15} />
        </span>
        <p className="text-[12px] font-medium text-danger">Foto gagal dimuat. Coba buka lagi.</p>
      </div>
    );
  }

  if (!url) {
    return <div className="h-[220px] animate-pulse rounded-card bg-surface-muted" />;
  }

  return (
    <img
      src={url}
      alt={alt || LABEL_FALLBACK[type]}
      className={cn('w-full rounded-card border border-line object-contain', className)}
    />
  );
}
