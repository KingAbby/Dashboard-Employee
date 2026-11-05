import { useEffect, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { RefreshIcon, SearchIcon } from '../../components/ui/icons';
import { AttendancePhotoModal } from '../../features/attendance/AttendancePhotoModal';
import { AttendanceStatusBadge } from '../../features/attendance/AttendanceStatusBadge';
import { useAdminAttendances } from '../../features/attendance/api';
import { toErrorMessage } from '../../lib/api';
import { formatDate, formatTime, todayISODate } from '../../lib/format';
import type { AdminAttendance, AttendanceStatus } from '../../types/api';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | AttendanceStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua status' },
  { value: 'ON_TIME', label: 'Tepat waktu' },
  { value: 'LATE', label: 'Terlambat' },
];

export function AbsensiPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [preview, setPreview] = useState<AdminAttendance | null>(null);

  const listQuery = useAdminAttendances({
    page,
    limit: PAGE_SIZE,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const isFiltering = Boolean(dateFrom || dateTo || search || status !== 'all');

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setPage(1);
  };

  const columns: Column<AdminAttendance>[] = [
    {
      header: 'Karyawan',
      cell: (row) => {
        const name = row.employee?.fullName ?? 'Karyawan tidak dikenal';
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-subtle">
                {row.employee?.employeeCode ?? '—'}
                {row.employee?.department ? ` · ${row.employee.department}` : ''}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Tanggal',
      cell: (row) => (
        <p className="text-[12.5px] font-semibold text-ink">{formatDate(row.attendanceDate)}</p>
      ),
    },
    {
      header: 'Masuk',
      cell: (row) => (
        <div>
          <p className="tabular-nums text-[12.5px] text-ink">{formatTime(row.checkInAt)}</p>
          {row.note ? (
            <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-subtle">{row.note}</p>
          ) : null}
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
        <Button size="sm" variant="secondary" onClick={() => setPreview(row)}>
          Lihat bukti
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Monitoring absensi"
        title="Absensi seluruh karyawan"
        description="Hanya baca. Admin HRD memantau absensi yang sudah disubmit beserta foto buktinya, tanpa kemampuan mengubah atau menghapus."
        action={
          <Badge tone="primary">
            {listQuery.data ? `${listQuery.data.meta.total} catatan` : 'Memuat…'}
          </Badge>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <Input
              label="Dari tanggal"
              type="date"
              className="w-full sm:w-[150px]"
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
              className="w-full sm:w-[150px]"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setDateFrom(todayISODate());
                setDateTo(todayISODate());
                setPage(1);
              }}
            >
              Hari ini
            </Button>
            <Input
              label="Cari karyawan"
              type="search"
              className="w-full sm:min-w-[220px] sm:flex-1"
              placeholder="Nama, kode, atau email"
              icon={<SearchIcon size={14} />}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Status"
              className="w-full sm:w-[180px]"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {isFiltering ? (
              <Button variant="ghost" className="w-full sm:w-auto" onClick={resetFilters}>
                Reset filter
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-subtle">
              {listQuery.isFetching
                ? 'Memperbarui data…'
                : isFiltering
                  ? 'Filter aktif. Data di bawah hanya yang cocok dengan filter.'
                  : 'Seluruh absensi, terbaru di atas.'}
            </p>
            <button
              type="button"
              onClick={() => void listQuery.refetch()}
              aria-label="Muat ulang data"
              title="Muat ulang"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line text-muted transition-colors hover:bg-bg hover:text-ink"
            >
              <RefreshIcon
                size={14}
                className={listQuery.isFetching ? 'animate-spin text-primary' : undefined}
              />
            </button>
          </div>
        </div>

        <DataTable
          caption="Daftar absensi seluruh karyawan"
          columns={columns}
          rows={listQuery.data?.data ?? []}
          rowKey={(row) => row.id}
          loading={listQuery.isLoading}
          fetching={listQuery.isFetching}
          error={listQuery.isError ? toErrorMessage(listQuery.error) : null}
          onRetry={() => void listQuery.refetch()}
          meta={listQuery.data?.meta}
          onPageChange={setPage}
          emptyTitle={isFiltering ? 'Tidak ada absensi yang cocok' : 'Belum ada absensi'}
          emptyDescription={
            isFiltering
              ? 'Coba longgarkan rentang tanggal, ubah kata kunci, atau ganti status.'
              : 'Data akan muncul setelah karyawan absen masuk dengan foto bukti.'
          }
          emptyAction={
            isFiltering ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset filter
              </Button>
            ) : undefined
          }
        />
      </Card>

      <AttendancePhotoModal attendance={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
