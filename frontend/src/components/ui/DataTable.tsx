import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { PaginationMeta } from '../../types/api';
import { Button } from './Button';
import { ChevronLeftIcon, ChevronRightIcon, RefreshIcon, SearchIcon } from './icons';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  skeletonRows?: number;
}

const SKELETON_WIDTHS = ['w-32', 'w-24', 'w-20', 'w-28', 'w-16'];

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  error = null,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  meta,
  onPageChange,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="card-surface overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-tint text-danger">
            <RefreshIcon size={18} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Data gagal dimuat</p>
            <p className="mt-1 max-w-sm text-[12px] text-muted">{error}</p>
          </div>
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshIcon size={13} />}>
              Coba lagi
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line bg-bg/70">
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={cn('label-caps whitespace-nowrap px-5 py-3 text-subtle', column.headerClassName)}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="border-b border-line/70">
                      {columns.map((column, columnIndex) => (
                        <td key={column.header} className="px-5 py-4">
                          <div
                            className={cn(
                              'h-3 animate-pulse rounded bg-black/[0.06]',
                              SKELETON_WIDTHS[columnIndex % SKELETON_WIDTHS.length],
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={rowKey(row)}
                      className="border-b border-line/70 transition-colors last:border-0 hover:bg-bg/60"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.header}
                          className={cn('px-5 py-3.5 align-middle text-[13px] text-ink', column.className)}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}

              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-subtle">
                        <SearchIcon size={18} />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{emptyTitle}</p>
                        {emptyDescription ? (
                          <p className="mt-1 max-w-sm text-[12px] text-muted">{emptyDescription}</p>
                        ) : null}
                      </div>
                      {emptyAction}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {meta && !error ? (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted">
            {meta.total === 0 ? (
              'Tidak ada data'
            ) : (
              <>
                Menampilkan <span className="font-semibold text-ink">{from}</span>–
                <span className="font-semibold text-ink">{to}</span> dari{' '}
                <span className="font-semibold text-ink">{meta.total}</span> data
              </>
            )}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1 || !onPageChange}
              aria-label="Halaman sebelumnya"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <span className="px-1.5 text-[11px] font-semibold text-muted">
              {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || !onPageChange}
              aria-label="Halaman berikutnya"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
