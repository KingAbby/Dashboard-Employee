import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';
import { Role } from '../../enums/role.enum';

export class ListEmployeesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Pencarian harus berupa teks.' })
  @MaxLength(120, { message: 'Pencarian maksimal 120 karakter.' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean({ message: 'Filter status aktif harus boolean.' })
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Role, { message: 'Filter role harus EMPLOYEE atau ADMIN_HRD.' })
  role?: Role;
}
