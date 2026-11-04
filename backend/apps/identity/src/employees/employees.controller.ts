import {
  MESSAGE_PATTERNS,
  type CreateEmployeePayload,
  type DeactivateEmployeePayload,
  type GetEmployeePayload,
  type IdsPayload,
  type ListEmployeesQueryDto,
  type UpdateEmployeePayload,
} from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_LIST)
  list(@Payload() query: ListEmployeesQueryDto) {
    return this.employeesService.findAll(query);
  }

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET_MANY)
  getMany(@Payload() payload: IdsPayload) {
    return this.employeesService.findManyByIds(payload.ids);
  }

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET)
  get(@Payload() payload: GetEmployeePayload) {
    return this.employeesService.findOne(payload.id);
  }

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_CREATE)
  create(@Payload() payload: CreateEmployeePayload) {
    return this.employeesService.create(payload.dto);
  }

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_UPDATE)
  update(@Payload() payload: UpdateEmployeePayload) {
    return this.employeesService.update(payload.id, payload.dto, payload.actorId);
  }

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_DEACTIVATE)
  deactivate(@Payload() payload: DeactivateEmployeePayload) {
    return this.employeesService.deactivate(payload.id, payload.actorId);
  }
}
