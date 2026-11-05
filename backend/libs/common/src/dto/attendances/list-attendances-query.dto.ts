import { IsEnum, IsOptional, IsUUID, Matches } from 'class-validator';
import { AttendanceStatus } from '../../enums/attendance-status.enum';
import { PaginationQueryDto } from '../pagination-query.dto';

/**
 * Query halaman monitoring admin. Semua filter opsional supaya admin bisa
 * melihat seluruh absensi tanpa mengisi apa pun.
 */
export class ListAttendancesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID karyawan tidak valid.' })
  employeeId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, { message: 'Status absensi harus ON_TIME atau LATE.' })
  status?: AttendanceStatus;
}
