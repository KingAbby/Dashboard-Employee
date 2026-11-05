import { AttendancePhoto } from '../../features/attendance/AttendancePhoto';
import type { AttendancePhotoType } from '../../types/api';
import { Modal } from './Modal';

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
        <AttendancePhoto
          key={`${attendanceId}-${type}`}
          attendanceId={attendanceId}
          type={type}
          alt={LABEL[type]}
          className="max-h-[70vh]"
        />
      ) : null}
    </Modal>
  );
}
