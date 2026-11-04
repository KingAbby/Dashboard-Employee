import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';
import { UpdateEmployeeDto } from './update-employee.dto';

/** Amplop payload pesan TCP. Gateway menilai DTO, service memvalidasi ulang. */

export class GetEmployeePayload {
  @IsUUID('4', { message: 'ID tidak valid.' })
  id!: string;
}

export class IdsPayload {
  @IsUUID('4', { each: true, message: 'ID tidak valid.' })
  ids!: string[];
}

export class CreateEmployeePayload {
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  dto!: CreateEmployeeDto;
}

export class UpdateEmployeePayload {
  @IsUUID('4', { message: 'ID tidak valid.' })
  id!: string;

  @ValidateNested()
  @Type(() => UpdateEmployeeDto)
  dto!: UpdateEmployeeDto;

  @IsOptional()
  @IsUUID('4', { message: 'ID pelaku tidak valid.' })
  actorId?: string;
}

export class DeactivateEmployeePayload {
  @IsUUID('4', { message: 'ID tidak valid.' })
  id!: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID pelaku tidak valid.' })
  actorId?: string;
}
