import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { PhotoPreview } from '../../components/ui/PhotoPreview';
import { AttendanceStatusBadge } from '../../features/attendance/AttendanceStatusBadge';
import { useMyAttendances } from '../../features/attendance/api';
import { toErrorMessage } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/format';
import type { Attendance, AttendancePhotoType } from '../../types/api';

const PAGE_SIZE = 10;

export function RiwayatPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [preview, setPreview] = useState<{ id: string; type: AttendancePhotoType } | null>(null);

  const query = useMyAttendances({
    page,
    limit: PAGE_SIZE,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const isFiltering = Boolean(dateFrom || dateTo);

  const columns: Column<Attendance>[] = [
    {
      header: 'Tanggal',
      cell: (row) => (
        <div>
          <p className="text-[12.5px] font-semibold text-ink">{formatDate(row.attendanceDate)}</p>
          <p className="mt-0.5 hidden text-[10.5px] uppercase tracking-[0.06em] text-subtle sm:block">
            {row.attendanceDate}
          </p>
        </div>
      ),
    },
    {
      header: 'Masuk',
      cell: (row) => (
        <div>
          <p className="tabular-nums text-[12.5px] text-ink">{formatTime(row.checkInAt)}</p>
          {row.note ? <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-subtle">{row.note}</p> : null}
        </div>
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
    {
      header: 'Foto',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={!row.checkInPhoto}
            onClick={() => setPreview({ id: row.id, type: 'in' })}
          >
            Masuk
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!row.checkOutPhoto}
            onClick={() => setPreview({ id: row.id, type: 'out' })}
          >
            Pulang
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Riwayat absensi"
        title="Riwayat saya"
        description="Seluruh absensi milikmu, lengkap dengan foto bukti masuk dan pulang."
        action={
          <Badge tone="primary">
            {query.data ? `${query.data.meta.total} catatan` : 'Memuat…'}
          </Badge>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Dari tanggal"
              type="date"
              className="sm:w-[160px]"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
            <Input
              label="Sampai tanggal"
              type="date"
              className="sm:w-[160px]"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
            {isFiltering ? (
              <Button
                variant="secondary"
                size="sm"
                className="mb-0.5"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setPage(1);
                }}
              >
                Reset filter
              </Button>
            ) : null}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="mb-0.5 self-start sm:self-auto"
            onClick={() => void query.refetch()}
            loading={query.isFetching}
          >
            Muat ulang
          </Button>
        </div>

        <DataTable
          caption="Riwayat absensi saya"
          columns={columns}
          rows={query.data?.data ?? []}
          rowKey={(row) => row.id}
          loading={query.isLoading}
          error={query.isError ? toErrorMessage(query.error) : null}
          onRetry={() => void query.refetch()}
          meta={query.data?.meta}
          onPageChange={setPage}
          emptyTitle={isFiltering ? 'Tidak ada absensi pada rentang itu' : 'Belum ada riwayat absensi'}
          emptyDescription={
            isFiltering
              ? 'Coba longgarkan rentang tanggalnya.'
              : 'Riwayat akan muncul setelah kamu absen masuk lewat halaman Absen Hari Ini.'
          }
        />
      </Card>

      <PhotoPreview
        open={preview !== null}
        onClose={() => setPreview(null)}
        attendanceId={preview?.id ?? null}
        type={preview?.type ?? 'in'}
      />
    </div>
  );
}
