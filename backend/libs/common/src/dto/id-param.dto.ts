import { IsString, Length } from 'class-validator';

export class IdParamDto {
  @IsString()
  @Length(36, 36, { message: 'ID tidak valid.' })
  id!: string;
}
