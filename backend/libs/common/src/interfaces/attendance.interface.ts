import type { AttendanceStatus } from '../enums/attendance-status.enum';

export interface AttendanceResponse {
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

/** Status absen hari ini + jam server, dipakai halaman /absen. */
export interface TodayAttendanceResponse {
  date: string;
  serverTime: string;
  workStartTime: string;
  lateToleranceMinutes: number;
  attendance: AttendanceResponse | null;
}

/**
 * Potongan data karyawan yang ditempelkan gateway ke absensi admin.
 * Sengaja tanpa email/phone: halaman monitoring hanya butuh identitas kerja.
 */
export interface AttendanceEmployeeSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  position: string | null;
  department: string | null;
  isActive: boolean;
}

export interface AdminAttendanceResponse extends AttendanceResponse {
  employee: AttendanceEmployeeSummary | null;
}

/** Hitungan satu hari dari attendance service. */
export interface AttendanceDayCountsResponse {
  date: string;
  present: number;
  onTime: number;
  late: number;
  checkedOut: number;
}

/** Ringkasan untuk dashboard admin: hitungan absensi + jumlah karyawan aktif. */
export interface AttendanceSummaryResponse extends AttendanceDayCountsResponse {
  totalActiveEmployees: number;
  notCheckedIn: number;
}
