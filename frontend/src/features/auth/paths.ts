import type { Role } from '../../types/api';

export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: '/absen',
  ADMIN_HRD: '/admin/absensi',
};

export const homePathFor = (role: Role): string => ROLE_HOME[role];
