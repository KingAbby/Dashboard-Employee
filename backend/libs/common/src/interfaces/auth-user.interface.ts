import type { Role } from '../enums/role.enum';

/** Profil user yang dipakai di dalam token dan request. */
export interface AuthUser {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PingResponse {
  service: string;
  pong: true;
  timestamp: string;
}
