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

export type AttendanceStatus = 'ON_TIME' | 'LATE';
export type AttendancePhotoType = 'in' | 'out';

export interface Attendance {
  id: string;
  employeeId: string;
  attendanceDate: string;
  checkInAt: string;
  checkInPhoto: string;
  checkOutAt: string | null;
  checkOutPhoto: string | null;
  status: AttendanceStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodayAttendance {
  date: string;
  serverTime: string;
  workStartTime: string;
  lateToleranceMinutes: number;
  attendance: Attendance | null;
}

export interface AttendanceQuery {
  page: number;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
}

/** Potongan karyawan yang ikut di daftar absensi admin (tanpa kontak pribadi). */
export interface AttendanceEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  position: string | null;
  department: string | null;
  isActive: boolean;
}

export interface AdminAttendance extends Attendance {
  employee: AttendanceEmployee | null;
}

export interface AttendanceAdminQuery {
  page: number;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  status?: AttendanceStatus;
}

export interface AttendanceSummary {
  date: string;
  present: number;
  onTime: number;
  late: number;
  checkedOut: number;
  totalActiveEmployees: number;
  notCheckedIn: number;
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
