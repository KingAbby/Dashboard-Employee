import type { AttendanceResponse } from '@app/common';
import type { Attendance } from './entities/attendance.entity';

export const toAttendanceResponse = (attendance: Attendance): AttendanceResponse => ({
  id: attendance.id,
  employeeId: attendance.employeeId,
  attendanceDate: attendance.attendanceDate,
  checkInAt: attendance.checkInAt.toISOString(),
  checkInPhoto: attendance.checkInPhoto,
  checkOutAt: attendance.checkOutAt ? attendance.checkOutAt.toISOString() : null,
  checkOutPhoto: attendance.checkOutPhoto,
  status: attendance.status,
  note: attendance.note,
  createdAt: attendance.createdAt.toISOString(),
  updatedAt: attendance.updatedAt.toISOString(),
});
