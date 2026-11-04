import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Body multipart absen; file fotonya ditangani multer, bukan DTO. */
export class AttendanceBodyDto {
  @IsOptional()
  @IsString({ message: 'Catatan harus berupa teks.' })
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter.' })
  note?: string;
}
