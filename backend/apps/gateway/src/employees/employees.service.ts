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

  nextCode(): Promise<{ employeeCode: string }> {
    return this.send<{ employeeCode: string }>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_NEXT_CODE, {});
  }

  detail(id: string): Promise<EmployeeResponse> {
    return this.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET, { id });
  }

  findMany(ids: string[]): Promise<EmployeeResponse[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.send<EmployeeResponse[]>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET_MANY, { ids });
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
