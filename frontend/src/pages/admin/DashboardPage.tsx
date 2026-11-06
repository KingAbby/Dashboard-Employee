import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  RefreshIcon,
  UsersIcon,
} from '../../components/ui/icons';
import { AttendanceStatusBadge } from '../../features/attendance/AttendanceStatusBadge';
import { useAdminAttendances, useAttendanceSummary } from '../../features/attendance/api';
import { toErrorMessage } from '../../lib/api';
import { useMinimumLoading } from '../../lib/use-min-loading';
import { formatClock, formatTime, todayISODate } from '../../lib/format';
import type { AdminAttendance } from '../../types/api';

const RECENT_LIMIT = 5;

export function DashboardPage() {
  const today = todayISODate();
  const summary = useAttendanceSummary();
  const recent = useAdminAttendances(
    {
      page: 1,
      limit: RECENT_LIMIT,
      dateFrom: today,
      dateTo: today,
    },
    { refetchInterval: 30_000 },
  );

  const showBusy = useMinimumLoading(summary.isFetching && !summary.isLoading);
  const updatedAt = summary.dataUpdatedAt ? formatClock(summary.dataUpdatedAt) : null;
  const refreshAll = () => {
    void Promise.all([summary.refetch(), recent.refetch()]);
  };

  const data = summary.data;
  const attendanceRate =
    data && data.totalActiveEmployees > 0
      ? Math.round((data.present / data.totalActiveEmployees) * 100)
      : null;

  const columns: Column<AdminAttendance>[] = [
    {
      header: 'Karyawan',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">
            {row.employee?.fullName ?? 'Karyawan tidak dikenal'}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-subtle">
            {row.employee?.employeeCode ?? '—'}
            {row.employee?.department ? ` · ${row.employee.department}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Masuk',
      cell: (row) => (
        <p className="tabular-nums text-[12.5px] text-ink">{formatTime(row.checkInAt)}</p>
      ),
    },
    {
      header: 'Pulang',
      cell: (row) => (
        <p className="tabular-nums text-[12.5px] text-ink">{formatTime(row.checkOutAt)}</p>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <AttendanceStatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Ringkasan"
        title="Ringkasan kehadiran"
        description="Angka hari ini dihitung langsung dari absensi yang sudah disubmit, bukan rekap manual."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-subtle">
              {showBusy ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <RefreshIcon size={12} className="animate-spin" />
                  Memperbarui…
                </span>
              ) : updatedAt ? (
                `Diperbarui ${updatedAt}`
              ) : (
                'Belum diperbarui'
              )}
            </span>
            <Button
              className="cursor-pointer"
              variant="secondary"
              size="sm"
              onClick={refreshAll}
              disabled={showBusy}
              aria-label="Muat ulang ringkasan"
              icon={<RefreshIcon size={13} />}
            >
              Muat ulang
            </Button>
          </div>
        }
      />

      {summary.isError ? (
        <div className="flex flex-col items-start gap-2 rounded-card border border-danger/25 bg-danger-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-danger">
              <AlertIcon size={15} />
            </span>
            <p className="text-[12px] font-medium text-danger">
              Ringkasan gagal dimuat: {toErrorMessage(summary.error)}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void summary.refetch()}
            icon={<RefreshIcon size={13} />}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hadir hari ini"
          value={data?.present ?? '—'}
          hint={
            data
              ? `${data.onTime} tepat waktu · ${data.late} terlambat`
              : 'Menghitung absensi hari ini'
          }
          tone="primary"
          icon={<ClockIcon size={16} />}
          loading={summary.isLoading}
        />
        <StatCard
          label="Terlambat"
          value={data?.late ?? '—'}
          hint="Masuk setelah batas jam kerja"
          tone="warning"
          icon={<AlertIcon size={16} />}
          loading={summary.isLoading}
        />
        <StatCard
          label="Sudah pulang"
          value={data?.checkedOut ?? '—'}
          hint={
            data
              ? data.present > 0
                ? `Dari ${data.present} karyawan yang sudah absen masuk`
                : 'Belum ada absensi masuk hari ini'
              : 'Menunggu data absensi'
          }
          tone="info"
          icon={<CheckIcon size={16} />}
          loading={summary.isLoading}
        />
        <StatCard
          label="Belum absen"
          value={data?.notCheckedIn ?? '—'}
          hint={
            data
              ? `${data.totalActiveEmployees} karyawan aktif${
                  attendanceRate !== null ? ` · kehadiran ${attendanceRate}%` : ''
                }`
              : 'Dari total karyawan aktif'
          }
          tone="danger"
          icon={<UsersIcon size={16} />}
          loading={summary.isLoading}
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-2 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
              Absensi terbaru hari ini
            </h2>
            <p className="mt-0.5 text-[11px] text-subtle">
              Lima catatan terakhir. Riwayat lengkap ada di halaman monitoring.
            </p>
          </div>
          <Link
            to="/admin/absensi"
            className="inline-flex items-center gap-1.5 self-start rounded-[8px] border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink transition-colors hover:bg-bg sm:self-auto"
          >
            Buka monitoring
            <ArrowRightIcon size={13} />
          </Link>
        </div>

        <DataTable
          caption="Absensi terbaru hari ini"
          columns={columns}
          rows={recent.data?.data ?? []}
          rowKey={(row) => row.id}
          loading={recent.isLoading}
          error={recent.isError ? toErrorMessage(recent.error) : null}
          onRetry={() => void recent.refetch()}
          emptyTitle="Belum ada absensi hari ini"
          emptyDescription="Catatan akan muncul begitu ada karyawan yang absen masuk."
          skeletonRows={3}
        />
      </Card>
    </div>
  );
}
