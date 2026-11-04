import { IsString, Length } from 'class-validator';

/** Dipakai untuk validasi parameter :id di gateway. */
export class IdParamDto {
  @IsString()
  @Length(36, 36, { message: 'ID tidak valid.' })
  id!: string;
}
