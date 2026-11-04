import { useEffect, useState } from 'react';
import { fetchAttendancePhoto } from '../../features/attendance/api';
import type { AttendancePhotoType } from '../../types/api';
import { Modal } from './Modal';
import { AlertIcon } from './icons';

export interface PhotoPreviewProps {
  open: boolean;
  onClose: () => void;
  attendanceId: string | null;
  type: AttendancePhotoType;
}

const LABEL: Record<AttendancePhotoType, string> = {
  in: 'Foto absen masuk',
  out: 'Foto absen pulang',
};

/** Foto tidak publik, jadi diambil sebagai blob memakai header Authorization. */
export function PhotoPreview({ open, onClose, attendanceId, type }: PhotoPreviewProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={LABEL[type]}
      description="Diambil dari endpoint terautentikasi, hanya untuk pemilik absensi atau admin HRD."
      size="md"
    >
      {open && attendanceId ? (
        <PhotoBody key={`${attendanceId}-${type}`} attendanceId={attendanceId} type={type} />
      ) : null}
    </Modal>
  );
}

function PhotoBody({ attendanceId, type }: { attendanceId: string; type: AttendancePhotoType }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
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
  }, [attendanceId, type]);

  if (failed) {
    return (
      <div className="flex items-center gap-2 rounded-card border border-danger/25 bg-danger-tint px-3 py-3">
        <span className="text-danger">
          <AlertIcon size={15} />
        </span>
        <p className="text-[12px] font-medium text-danger">Foto gagal dimuat. Coba buka lagi.</p>
      </div>
    );
  }

  if (!url) {
    return <div className="h-[280px] animate-pulse rounded-card bg-surface-muted" />;
  }

  return (
    <img
      src={url}
      alt={LABEL[type]}
      className="max-h-[70vh] w-full rounded-card border border-line object-contain"
    />
  );
}
