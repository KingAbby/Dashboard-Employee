import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';
import { UpdateEmployeeDto } from './update-employee.dto';

export class GetEmployeePayload {
  @IsUUID('all', { message: 'ID tidak valid.' })
  id!: string;
}

export class IdsPayload {
  @IsUUID('all', { each: true, message: 'ID tidak valid.' })
  ids!: string[];
}

export class CreateEmployeePayload {
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  dto!: CreateEmployeeDto;
}

export class UpdateEmployeePayload {
  @IsUUID('all', { message: 'ID tidak valid.' })
  id!: string;

  @ValidateNested()
  @Type(() => UpdateEmployeeDto)
  dto!: UpdateEmployeeDto;

  @IsOptional()
  @IsUUID('all', { message: 'ID pelaku tidak valid.' })
  actorId?: string;
}

export class DeactivateEmployeePayload {
  @IsUUID('all', { message: 'ID tidak valid.' })
  id!: string;

  @IsOptional()
  @IsUUID('all', { message: 'ID pelaku tidak valid.' })
  actorId?: string;
}
