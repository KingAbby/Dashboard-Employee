export type Role = 'EMPLOYEE' | 'ADMIN_HRD';

export interface AuthUser {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Employee {
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
  createdAt: string;
  updatedAt: string;
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

export interface LoginResponse {
  accessToken: string;
  user: Employee;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
}

export interface EmployeePayload {
  employeeCode?: string;
  fullName: string;
  email: string;
  password?: string;
  role?: Role;
  position?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  isActive?: boolean;
}

export interface EmployeeQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}
