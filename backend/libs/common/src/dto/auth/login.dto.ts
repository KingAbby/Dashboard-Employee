import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/** class-validator membaca decorator terakhir dulu; "wajib diisi" ditaruh paling akhir. */
export class LoginDto {
  @MaxLength(150, { message: 'Email maksimal 150 karakter.' })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  email!: string;

  @MaxLength(72, { message: 'Password maksimal 72 karakter.' })
  @MinLength(1, { message: 'Password wajib diisi.' })
  @IsString({ message: 'Password wajib diisi.' })
  password!: string;
}
