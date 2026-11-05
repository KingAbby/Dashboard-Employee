import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, Matches } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

/** employeeId selalu diambil dari JWT di gateway, bukan dari klien. */
export class CheckInPayloadDto {
  @IsUUID('all', { message: 'ID karyawan tidak valid.' })
  employeeId!: string;

  @IsString({ message: 'Foto bukti wajib dilampirkan.' })
  @MaxLength(255)
  photo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter.' })
  note?: string;
}

export class CheckOutPayloadDto extends CheckInPayloadDto {}

export class EmployeeTodayPayloadDto {
  @IsUUID('all', { message: 'ID karyawan tidak valid.' })
  employeeId!: string;
}

export class AttendanceIdPayloadDto {
  @IsUUID('all', { message: 'ID absensi tidak valid.' })
  id!: string;
}

export class MyAttendancesQueryDto extends PaginationQueryDto {
  @IsUUID('all', { message: 'ID karyawan tidak valid.' })
  employeeId!: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal mulai tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal akhir tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;
}
