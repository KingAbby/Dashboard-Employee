import { IsIn, IsOptional, Matches } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

/** Query halaman /riwayat: rentang tanggal opsional. */
export class ListMyAttendancesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal mulai harus berformat YYYY-MM-DD.' })
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal akhir harus berformat YYYY-MM-DD.' })
  dateTo?: string;
}

/** Parameter ?type=in|out pada endpoint foto. */
export class AttendancePhotoQueryDto {
  @IsOptional()
  @IsIn(['in', 'out'], { message: 'Tipe foto harus in atau out.' })
  type?: 'in' | 'out' = 'in';
}
