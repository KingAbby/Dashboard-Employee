import { AppRpcException, ERROR_MESSAGES, type LoginDto, type LoginResult } from '@app/common';
import { Injectable } from '@nestjs/common';
import { verifyPassword } from '../common/password.util';
import { toEmployeeResponse } from '../employees/employee.mapper';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AuthService {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * Hanya memvalidasi kredensial. Penerbitan JWT dilakukan gateway,
   * supaya service ini tidak perlu tahu soal token.
   */
  async login(dto: LoginDto): Promise<LoginResult> {
    const employee = await this.employeesService.findByEmailForLogin(dto.email);

    if (!employee) {
      throw AppRpcException.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatches = await verifyPassword(dto.password, employee.passwordHash);
    if (!passwordMatches) {
      throw AppRpcException.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!employee.isActive) {
      throw AppRpcException.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    return { user: toEmployeeResponse(employee) };
  }
}
