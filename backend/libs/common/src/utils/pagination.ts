import type { Paginated, PaginationMeta } from '../interfaces/auth-user.interface';

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
});

export const buildPaginated = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): Paginated<T> => ({
  data,
  meta: buildPaginationMeta(page, limit, total),
});
