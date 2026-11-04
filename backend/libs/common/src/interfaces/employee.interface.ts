import type { Role } from '../enums/role.enum';

/** Bentuk karyawan yang boleh keluar dari API (tanpa password_hash). */
export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Role;
  position: string | null;
  department: string | null;
  phone: string | null;
  joinDate: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResult {
  user: EmployeeResponse;
}
