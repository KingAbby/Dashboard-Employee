import { IsDateString, IsIn, IsOptional, Matches } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

export class ListMyAttendancesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal mulai tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal akhir tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;
}

export class AttendancePhotoQueryDto {
  @IsOptional()
  @IsIn(['in', 'out'], { message: 'Tipe foto harus in atau out.' })
  type?: 'in' | 'out' = 'in';
}
