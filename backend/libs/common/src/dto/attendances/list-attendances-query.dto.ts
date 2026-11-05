import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { AttendanceStatus } from '../../enums/attendance-status.enum';
import { PaginationQueryDto } from '../pagination-query.dto';

/** Filter opsional: admin bisa melihat semua absensi tanpa mengisi apa pun. */
export class ListAttendancesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal mulai tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal akhir tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;

  @IsOptional()
  @IsUUID('all', { message: 'ID karyawan tidak valid.' })
  employeeId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'ID karyawan tidak valid.' })
  employeeIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(120, { message: 'Kata kunci pencarian maksimal 120 karakter.' })
  @IsString({ message: 'Kata kunci pencarian harus berupa teks.' })
  search?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, { message: 'Status absensi harus ON_TIME atau LATE.' })
  status?: AttendanceStatus;
}
