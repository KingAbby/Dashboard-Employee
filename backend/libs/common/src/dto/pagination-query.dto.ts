import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/message-patterns';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Halaman harus berupa angka.' })
  @Min(1, { message: 'Halaman minimal 1.' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka.' })
  @Min(1, { message: 'Limit minimal 1.' })
  @Max(MAX_PAGE_SIZE, { message: `Limit maksimal ${MAX_PAGE_SIZE}.` })
  limit: number = DEFAULT_PAGE_SIZE;
}
