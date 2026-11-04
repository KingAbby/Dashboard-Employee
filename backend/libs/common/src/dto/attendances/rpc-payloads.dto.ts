import { IsOptional, IsString, IsUUID, MaxLength, Matches } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

/** employeeId selalu diambil dari JWT di gateway, bukan dari klien. */
export class CheckInPayloadDto {
  @IsUUID('4', { message: 'ID karyawan tidak valid.' })
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
  @IsUUID('4', { message: 'ID karyawan tidak valid.' })
  employeeId!: string;
}

export class AttendanceIdPayloadDto {
  @IsUUID('4', { message: 'ID absensi tidak valid.' })
  id!: string;
}

export class MyAttendancesQueryDto extends PaginationQueryDto {
  @IsUUID('4', { message: 'ID karyawan tidak valid.' })
  employeeId!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;
}
