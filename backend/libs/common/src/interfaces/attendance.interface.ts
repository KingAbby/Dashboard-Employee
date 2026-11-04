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
