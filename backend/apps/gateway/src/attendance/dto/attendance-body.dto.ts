import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AttendanceBodyDto {
  @IsOptional()
  @IsString({ message: 'Catatan harus berupa teks.' })
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter.' })
  note?: string;
}
