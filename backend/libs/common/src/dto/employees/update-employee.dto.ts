import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DEPARTMENTS } from '../../constants/departments';
import { Role } from '../../enums/role.enum';

export class UpdateEmployeeDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[A-Za-z0-9-]*$/, {
    message: 'Kode karyawan hanya boleh huruf, angka, dan tanda hubung.',
  })
  @MaxLength(20, { message: 'Kode karyawan maksimal 20 karakter.' })
  @IsString({ message: 'Kode karyawan harus berupa teks.' })
  employeeCode?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(120, { message: 'Nama lengkap maksimal 120 karakter.' })
  @MinLength(2, { message: 'Nama lengkap minimal 2 karakter.' })
  @IsString({ message: 'Nama lengkap wajib diisi.' })
  fullName?: string;

  @IsOptional()
  @MaxLength(150, { message: 'Email maksimal 150 karakter.' })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  email?: string;

  @IsOptional()
  @MaxLength(72, { message: 'Password maksimal 72 karakter.' })
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  @IsString({ message: 'Password harus berupa teks.' })
  password?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role harus EMPLOYEE atau ADMIN_HRD.' })
  role?: Role;

  @IsOptional()
  @MaxLength(100, { message: 'Jabatan maksimal 100 karakter.' })
  @IsString({ message: 'Jabatan harus berupa teks.' })
  position?: string;

  @IsOptional()
  @IsIn(DEPARTMENTS, { message: 'Divisi tidak dikenal.' })
  @MaxLength(100, { message: 'Divisi maksimal 100 karakter.' })
  @IsString({ message: 'Divisi harus berupa teks.' })
  department?: string;

  @IsOptional()
  @Matches(/^[0-9+\-\s()]*$/, { message: 'Nomor telepon hanya boleh angka dan simbol + - ( ).' })
  @MaxLength(30, { message: 'Nomor telepon maksimal 30 karakter.' })
  @IsString({ message: 'Nomor telepon harus berupa teks.' })
  phone?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal masuk tidak valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal masuk harus berformat YYYY-MM-DD.' })
  joinDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean({ message: 'Status aktif harus boolean.' })
  isActive?: boolean;
}
