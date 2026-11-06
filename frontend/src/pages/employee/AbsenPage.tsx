import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { PhotoCapture } from '../../components/ui/PhotoCapture';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/useToast';
import { ClockIcon, HistoryIcon, LockIcon, RefreshIcon } from '../../components/ui/icons';
import { AttendanceStatusBadge } from '../../features/attendance/AttendanceStatusBadge';
import {
  useCheckIn,
  useCheckOut,
  useMyAttendances,
  useTodayAttendance,
} from '../../features/attendance/api';
import { useServerClock } from '../../features/attendance/use-server-clock';
import { toErrorMessage } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/format';
import { useAuth } from '../../features/auth/useAuth';

export function AbsenPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const todayQuery = useTodayAttendance();
  const recentQuery = useMyAttendances({ page: 1, limit: 5 });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const serverNow = useServerClock(todayQuery.data?.serverTime);
  const attendance = todayQuery.data?.attendance ?? null;
  const workEndTime = todayQuery.data?.workEndTime ?? '17:00';
  const nowTime = formatTime(serverNow.toISOString());
  const checkOutLocked = Boolean(attendance && !attendance.checkOutAt && nowTime < workEndTime);

  const [photo, setPhoto] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const submitting = checkIn.isPending || checkOut.isPending;
  const isComplete = Boolean(attendance?.checkOutAt);

  const submit = async (kind: 'in' | 'out') => {
    setFormError(null);
    setPhotoError(null);

    if (!photo) {
      setPhotoError('Foto bukti wajib dilampirkan.');
      return;
    }

    const form = new FormData();
    form.append('photo', photo);
    if (note.trim()) form.append('note', note.trim());

    try {
      if (kind === 'in') {
        await checkIn.mutateAsync(form);
        toast('Absen masuk tercatat.');
      } else {
        await checkOut.mutateAsync(form);
        toast('Absen pulang tercatat.');
      }
      setPhoto(null);
      setNote('');
      setFormKey((current) => current + 1);
    } catch (error) {
      setFormError(toErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Absensi WFH"
        title={`Halo, ${user?.fullName.split(' ')[0] ?? 'kamu'}`}
        description={`Catat kehadiran hari ini. Waktu mengikuti server (WIB), foto bukti wajib dilampirkan.`}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void todayQuery.refetch()}
            loading={todayQuery.isFetching}
            icon={<RefreshIcon size={13} />}
          >
            Muat ulang
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-subtle">Waktu server</p>
              <p className="mt-1 text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
                {formatTime(serverNow.toISOString())}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted">
                {formatDate(todayQuery.data?.date)} · WIB
                <span className="mt-0.5 block whitespace-nowrap">
                  Jam masuk{' '}
                  <span className="font-semibold tabular-nums text-ink">
                    {todayQuery.data?.workStartTime ?? '09:00'}
                  </span>
                </span>
              </p>
            </div>
            <AttendanceStatusBadge status={attendance?.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[9px] border border-line bg-bg/60 px-3 py-2.5">
              <p className="label-caps text-[9px] text-subtle">Masuk</p>
              <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">
                {formatTime(attendance?.checkInAt)}
              </p>
            </div>
            <div className="rounded-[9px] border border-line bg-bg/60 px-3 py-2.5">
              <p className="label-caps text-[9px] text-subtle">Pulang</p>
              <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">
                {formatTime(attendance?.checkOutAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            {todayQuery.isLoading ? (
              <div className="h-[240px] animate-pulse rounded-card bg-surface-muted" />
            ) : todayQuery.isError ? (
              <p className="text-[12.5px] text-danger">
                Status absen gagal dimuat. Coba muat ulang.
              </p>
            ) : isComplete ? (
              <div className="flex items-center gap-2.5 rounded-card bg-success-tint px-3.5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-success">
                  <ClockIcon size={16} />
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">Absensi hari ini selesai</p>
                  <p className="text-[11.5px] text-muted">
                    Masuk {formatTime(attendance?.checkInAt)} · Pulang{' '}
                    {formatTime(attendance?.checkOutAt)}
                  </p>
                </div>
              </div>
            ) : checkOutLocked ? (
              <div className="flex items-center gap-2.5 rounded-card border border-line bg-bg/60 px-3.5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-muted">
                  <LockIcon size={15} />
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">Absen pulang belum dibuka</p>
                  <p className="text-[11.5px] text-muted">
                    Tersedia mulai pukul{' '}
                    <span className="font-semibold tabular-nums text-ink">{workEndTime}</span> WIB.
                    Sekarang {nowTime} WIB.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-ink">
                    {attendance ? 'Absen pulang' : 'Absen masuk'}
                  </p>
                  <Badge tone={attendance ? 'info' : 'primary'}>
                    {attendance ? 'Langkah 2 dari 2' : 'Langkah 1 dari 2'}
                  </Badge>
                </div>

                <PhotoCapture
                  key={formKey}
                  file={photo}
                  onChange={setPhoto}
                  error={photoError}
                  disabled={submitting}
                />

                <Textarea
                  label="Catatan (opsional)"
                  placeholder="Contoh: bekerja dari rumah"
                  value={note}
                  maxLength={255}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={submitting}
                />

                {formError ? (
                  <p className="rounded-card border border-danger/25 bg-danger-tint px-3 py-2 text-[12px] font-medium text-danger">
                    {formError}
                  </p>
                ) : null}

                <Button
                  fullWidth
                  loading={submitting}
                  disabled={!photo || checkOutLocked}
                  onClick={() => void submit(attendance ? 'out' : 'in')}
                  icon={<ClockIcon size={13} />}
                >
                  {attendance ? 'Absen pulang sekarang' : 'Absen masuk sekarang'}
                </Button>
                {!photo ? (
                  <p className="text-center text-[11px] text-subtle">
                    Lampirkan foto bukti dulu untuk mengaktifkan tombol.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
              <HistoryIcon size={15} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Aturan absensi</p>
              <p className="text-[11px] text-muted">Berlaku untuk semua karyawan</p>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {[
              `Jam masuk ${todayQuery.data?.workStartTime ?? '09:00'} WIB — lewat dari itu tercatat terlambat.`,
              `Absen pulang dibuka pukul ${workEndTime} WIB.`,
              'Foto bukti wajib untuk absen masuk dan pulang.',
              'Satu absen masuk dan satu absen pulang per hari.',
              'Waktu diambil dari server, bukan dari perangkatmu.',
            ].map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-2 text-[12px] leading-relaxed text-muted"
              >
                <span
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {rule}
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-4">
            <p className="label-caps text-[9px] text-subtle">Riwayat singkat</p>
            {recentQuery.isLoading ? (
              <div className="mt-2 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-black/[0.06]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-black/[0.06]" />
              </div>
            ) : recentQuery.isError ? (
              <p className="mt-2 text-[12px] text-danger">
                Riwayat singkat gagal dimuat. Coba muat ulang.
              </p>
            ) : (recentQuery.data?.data.length ?? 0) === 0 ? (
              <p className="mt-2 text-[12px] text-muted">Belum ada absensi tercatat.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {recentQuery.data?.data.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-muted">{formatDate(item.attendanceDate)}</span>
                    <span className="tabular-nums text-ink">
                      {formatTime(item.checkInAt)}–{formatTime(item.checkOutAt)}
                    </span>
                    <AttendanceStatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}

            <Link
              to="/riwayat"
              className="mt-3 inline-block text-[11.5px] font-semibold text-primary hover:underline"
            >
              Lihat semua riwayat →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
