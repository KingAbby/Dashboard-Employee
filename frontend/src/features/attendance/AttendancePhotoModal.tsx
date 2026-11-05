import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate, formatTime } from '../../lib/format';
import type { AdminAttendance } from '../../types/api';
import { AttendancePhoto } from './AttendancePhoto';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

export interface AttendancePhotoModalProps {
  attendance: AdminAttendance | null;
  onClose: () => void;
}

/**
 * Pratinjau foto bukti milik satu absensi: masuk dan pulang berdampingan.
 * Hanya baca — admin tidak bisa mengubah atau menghapus data dari sini.
 */
export function AttendancePhotoModal({ attendance, onClose }: AttendancePhotoModalProps) {
  const employeeName = attendance?.employee?.fullName ?? 'Karyawan tidak dikenal';

  return (
    <Modal
      open={attendance !== null}
      onClose={onClose}
      title="Foto bukti absensi"
      description={
        attendance
          ? `${employeeName} · ${attendance.employee?.employeeCode ?? '—'} · ${formatDate(attendance.attendanceDate)}`
          : undefined
      }
      size="lg"
    >
      {attendance ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AttendanceStatusBadge status={attendance.status} />
            <Badge tone="neutral">Masuk {formatTime(attendance.checkInAt)}</Badge>
            <Badge tone="neutral">Pulang {formatTime(attendance.checkOutAt)}</Badge>
          </div>

          {attendance.note ? (
            <div className="rounded-card border border-line bg-bg/60 px-3 py-2.5">
              <p className="label-caps text-[9px] text-subtle">Catatan karyawan</p>
              <p className="mt-1 text-[12.5px] text-ink">{attendance.note}</p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="min-w-0">
              <figcaption className="label-caps mb-1.5 text-subtle">Foto masuk</figcaption>
              <AttendancePhoto
                key={`${attendance.id}-in`}
                attendanceId={attendance.id}
                type="in"
                alt={`Foto absen masuk ${employeeName}`}
                hasPhoto={Boolean(attendance.checkInPhoto)}
                missingLabel="Foto masuk tidak tersedia."
              />
            </figure>

            <figure className="min-w-0">
              <figcaption className="label-caps mb-1.5 text-subtle">Foto pulang</figcaption>
              <AttendancePhoto
                key={`${attendance.id}-out`}
                attendanceId={attendance.id}
                type="out"
                alt={`Foto absen pulang ${employeeName}`}
                hasPhoto={Boolean(attendance.checkOutPhoto)}
                missingLabel="Belum absen pulang."
              />
            </figure>
          </div>

          <p className="text-[11px] text-subtle">
            Foto diambil dari endpoint terautentikasi dan hanya bisa dibuka pemilik absensi atau
            admin HRD. Data absensi tidak bisa diubah dari halaman ini.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
