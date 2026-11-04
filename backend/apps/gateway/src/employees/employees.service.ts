import {
  MESSAGE_PATTERNS,
  type CreateEmployeeDto,
  type EmployeeResponse,
  type ListEmployeesQueryDto,
  type Paginated,
  type UpdateEmployeeDto,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IDENTITY_CLIENT } from '../clients/clients.module';

@Injectable()
export class EmployeesService {
  constructor(@Inject(IDENTITY_CLIENT) private readonly identity: ClientProxy) {}

  list(query: ListEmployeesQueryDto): Promise<Paginated<EmployeeResponse>> {
    return this.send<Paginated<EmployeeResponse>>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_LIST, query);
  }

  detail(id: string): Promise<EmployeeResponse> {
    return this.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET, { id });
  }

  create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    return this.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_CREATE, { dto });
  }

  update(id: string, dto: UpdateEmployeeDto, actorId: string): Promise<EmployeeResponse> {
    return this.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_UPDATE, {
      id,
      dto,
      actorId,
    });
  }

  deactivate(id: string, actorId: string): Promise<EmployeeResponse> {
    return this.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_DEACTIVATE, {
      id,
      actorId,
    });
  }

  private send<T>(pattern: string, payload: unknown): Promise<T> {
    return firstValueFrom(this.identity.send<T>(pattern, payload));
  }
}
