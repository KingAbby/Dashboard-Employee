import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { useToast } from '../../components/ui/useToast';
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshIcon,
  SearchIcon,
  UsersIcon,
} from '../../components/ui/icons';
import { ROLE_LABEL } from '../../config/brand';
import { EmployeeFormModal } from '../../features/employees/EmployeeFormModal';
import {
  useDeactivateEmployee,
  useEmployeeCount,
  useEmployeesQuery,
} from '../../features/employees/api';
import { toErrorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import type { Employee } from '../../types/api';

type StatusFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

export function KaryawanPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const isActive = status === 'all' ? undefined : status === 'active';

  const listQuery = useEmployeesQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    isActive,
  });

  const totalCount = useEmployeeCount();
  const activeCount = useEmployeeCount(true);
  const inactiveCount = useEmployeeCount(false);

  const deactivateMutation = useDeactivateEmployee();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      toast(`${deactivateTarget.fullName} berhasil dinonaktifkan.`);
      setDeactivateTarget(null);
    } catch (error) {
      toast(toErrorMessage(error), 'error');
    }
  };

  const isFiltering = search.length > 0 || status !== 'all';

  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        header: 'Karyawan',
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.fullName} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{row.fullName}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-subtle">
                {row.employeeCode}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Kontak',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate text-[12.5px] text-ink">{row.email}</p>
            <p className="mt-0.5 text-[11px] text-subtle">{row.phone ?? 'Tanpa nomor telepon'}</p>
          </div>
        ),
      },
      {
        header: 'Struktur & jabatan',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold text-ink">{row.position ?? '—'}</p>
            <div className="mt-1">
              <Badge tone="neutral">{row.department ?? 'Tanpa divisi'}</Badge>
            </div>
          </div>
        ),
      },
      {
        header: 'Bergabung',
        cell: (row) => <p className="text-[12.5px] text-ink">{formatDate(row.joinDate)}</p>,
      },
      {
        header: 'Status',
        cell: (row) => (
          <div>
            <Badge tone={row.isActive ? 'success' : 'neutral'} dot>
              {row.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
            <p className="mt-1 text-[11px] text-muted">{ROLE_LABEL[row.role]}</p>
          </div>
        ),
      },
      {
        header: 'Aksi',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEdit(row)}
              aria-label={`Ubah data ${row.fullName}`}
              title="Ubah data"
              className="rounded-md border border-transparent p-1.5 text-muted transition-colors hover:border-line hover:bg-bg hover:text-ink"
            >
              <PencilIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDeactivateTarget(row)}
              disabled={!row.isActive}
              aria-label={`Nonaktifkan ${row.fullName}`}
              title={row.isActive ? 'Nonaktifkan' : 'Sudah nonaktif'}
              className="rounded-md border border-transparent p-1.5 text-muted transition-colors hover:border-danger/30 hover:bg-danger-tint hover:text-danger disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-subtle"
            >
              <PowerIcon size={14} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Manajemen karyawan"
        title="Data karyawan"
        description="Tambah, ubah, dan nonaktifkan akun karyawan. Data tidak pernah dihapus permanen agar riwayat absensi tetap bisa ditelusuri."
        action={
          <Button onClick={openCreate} icon={<PlusIcon size={14} />}>
            Tambah karyawan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total karyawan"
          value={totalCount.data ?? '—'}
          hint="Seluruh akun terdaftar"
          tone="primary"
          icon={<UsersIcon size={16} />}
          loading={totalCount.isLoading}
        />
        <StatCard
          label="Aktif"
          value={activeCount.data ?? '—'}
          hint="Bisa login dan absen"
          tone="success"
          icon={<CheckIcon size={16} />}
          loading={activeCount.isLoading}
        />
        <StatCard
          label="Nonaktif"
          value={inactiveCount.data ?? '—'}
          hint="Akses login dicabut"
          tone="neutral"
          icon={<PowerIcon size={16} />}
          loading={inactiveCount.isLoading}
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[300px]">
            <Input
              type="search"
              placeholder="Cari nama, kode, atau email…"
              aria-label="Cari karyawan"
              icon={<SearchIcon size={15} />}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Filter status karyawan"
              className="inline-flex h-10 items-center rounded-[9px] border border-line bg-surface p-0.5"
            >
              {FILTERS.map((filter) => {
                const active = status === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStatus(filter.value);
                      setPage(1);
                    }}
                    className={cn(
                      'h-full rounded-[7px] px-3 text-[11px] font-semibold transition-colors',
                      active ? 'bg-primary-tint font-bold text-primary' : 'text-muted hover:text-ink',
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void listQuery.refetch()}
              aria-label="Muat ulang data"
              title="Muat ulang"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-[9px] border border-line text-muted transition-colors hover:bg-bg hover:text-ink',
                listQuery.isFetching && 'animate-spin text-primary',
              )}
            >
              <RefreshIcon size={14} />
            </button>
          </div>
        </div>

        <DataTable
          caption="Daftar karyawan"
          columns={columns}
          rows={listQuery.data?.data ?? []}
          rowKey={(row) => row.id}
          loading={listQuery.isLoading}
          error={listQuery.isError ? toErrorMessage(listQuery.error) : null}
          onRetry={() => void listQuery.refetch()}
          meta={listQuery.data?.meta}
          onPageChange={setPage}
          emptyTitle={isFiltering ? 'Tidak ada karyawan yang cocok' : 'Belum ada data karyawan'}
          emptyDescription={
            isFiltering
              ? 'Coba ubah kata kunci atau filter status.'
              : 'Mulai dengan menambahkan akun karyawan pertama.'
          }
          emptyAction={
            isFiltering ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setStatus('all');
                }}
              >
                Reset filter
              </Button>
            ) : (
              <Button size="sm" onClick={openCreate} icon={<PlusIcon size={13} />}>
                Tambah karyawan
              </Button>
            )
          }
        />
      </Card>

      <EmployeeFormModal open={formOpen} employee={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Nonaktifkan karyawan?"
        description={
          deactivateTarget
            ? `${deactivateTarget.fullName} tidak akan bisa login lagi. Riwayat absensinya tetap tersimpan dan bisa diaktifkan kembali kapan saja.`
            : ''
        }
        confirmLabel="Ya, nonaktifkan"
        loading={deactivateMutation.isPending}
        onConfirm={() => void handleDeactivate()}
        onClose={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
