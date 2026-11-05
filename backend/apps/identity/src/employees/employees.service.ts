import {
  AppRpcException,
  ERROR_MESSAGES,
  Role,
  buildPaginated,
  type EmployeeResponse,
  type Paginated,
  type CreateEmployeeDto,
  type ListEmployeesQueryDto,
  type UpdateEmployeeDto,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { In, Not, Repository } from 'typeorm';
import { hashPassword } from '../common/password.util';
import { toEmployeeResponse } from './employee.mapper';
import { Employee } from './entities/employee.entity';

const emptyToNull = (value: string | undefined | null): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);
    await this.assertCodeAvailable(dto.employeeCode);

    const manualCode = dto.employeeCode?.trim();
    const base = {
      id: randomUUID(),
      fullName: dto.fullName.trim(),
      email,
      passwordHash: await hashPassword(dto.password),
      role: dto.role ?? Role.EMPLOYEE,
      position: emptyToNull(dto.position),
      department: emptyToNull(dto.department),
      phone: emptyToNull(dto.phone),
      joinDate: emptyToNull(dto.joinDate),
      isActive: dto.isActive ?? true,
    };

    // Dua admin bisa membuat karyawan bersamaan; unique index yang menang,
    // pemanggil yang kalah mengulang dengan kode setelahnya.
    let nextAttempt = 1;
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const employeeCode = manualCode ?? (await this.generateEmployeeCode(nextAttempt));
      try {
        const saved = await this.employees.save(this.employees.create({ ...base, employeeCode }));
        this.logger.log(`Karyawan dibuat: ${saved.employeeCode}`);
        return toEmployeeResponse(saved);
      } catch (error) {
        const duplicate = this.duplicateTarget(error);
        if (duplicate === 'email') {
          throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_EMAIL_TAKEN);
        }
        if (duplicate !== 'code') throw error;
        if (manualCode) throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CODE_TAKEN);
        nextAttempt = this.codeNumber(employeeCode) + 1;
      }
    }
    throw AppRpcException.conflict(
      'Kode karyawan sedang dibuat admin lain. Coba simpan lagi sebentar lagi.',
    );
  }

  async findAll(query: ListEmployeesQueryDto): Promise<Paginated<EmployeeResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.employees.createQueryBuilder('employee');

    if (query.search?.trim()) {
      const term = `%${query.search.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
      qb.andWhere(
        '(employee.full_name LIKE :term OR employee.employee_code LIKE :term OR employee.email LIKE :term)',
        { term },
      );
    }

    if (typeof query.isActive === 'boolean') {
      qb.andWhere('employee.is_active = :isActive', { isActive: query.isActive });
    }

    if (query.role) {
      qb.andWhere('employee.role = :role', { role: query.role });
    }

    qb.orderBy('employee.created_at', 'DESC')
      .addOrderBy('employee.employee_code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return buildPaginated(rows.map(toEmployeeResponse), page, limit, total);
  }

  async findOne(id: string): Promise<EmployeeResponse> {
    const employee = await this.employees.findOne({ where: { id } });
    if (!employee) throw AppRpcException.notFound(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
    return toEmployeeResponse(employee);
  }

  async findManyByIds(ids: string[]): Promise<EmployeeResponse[]> {
    if (ids.length === 0) return [];
    const rows = await this.employees.find({ where: { id: In(ids) } });
    return rows.map(toEmployeeResponse);
  }

  /** Untuk autentikasi: butuh password_hash yang secara default tidak di-select. */
  async findByEmailForLogin(email: string): Promise<Employee | null> {
    return this.employees
      .createQueryBuilder('employee')
      .addSelect('employee.passwordHash')
      .where('employee.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  async update(id: string, dto: UpdateEmployeeDto, actorId?: string): Promise<EmployeeResponse> {
    const employee = await this.employees.findOne({ where: { id } });
    if (!employee) throw AppRpcException.notFound(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);

    if (dto.isActive === false && actorId === id) {
      throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CANNOT_DEACTIVATE_SELF);
    }
    if (dto.role !== undefined && dto.role !== employee.role && actorId === id) {
      throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CANNOT_CHANGE_OWN_ROLE);
    }

    if (dto.email && dto.email.trim().toLowerCase() !== employee.email) {
      const email = dto.email.trim().toLowerCase();
      await this.assertEmailAvailable(email, id);
      employee.email = email;
    }

    if (dto.employeeCode !== undefined) {
      const code = dto.employeeCode.trim();
      // Kode kosong dianggap "tidak diubah", sama seperti perilaku create.
      if (code && code !== employee.employeeCode) {
        await this.assertCodeAvailable(code, id);
        employee.employeeCode = code;
      }
    }

    if (dto.fullName !== undefined) employee.fullName = dto.fullName.trim();
    if (dto.role !== undefined) employee.role = dto.role;
    if (dto.position !== undefined) employee.position = emptyToNull(dto.position);
    if (dto.department !== undefined) employee.department = emptyToNull(dto.department);
    if (dto.phone !== undefined) employee.phone = emptyToNull(dto.phone);
    if (dto.joinDate !== undefined) employee.joinDate = emptyToNull(dto.joinDate);
    if (dto.isActive !== undefined) employee.isActive = dto.isActive;
    if (dto.password) employee.passwordHash = await hashPassword(dto.password);

    let saved: Employee;
    try {
      saved = await this.employees.save(employee);
    } catch (error) {
      const duplicate = this.duplicateTarget(error);
      if (duplicate === 'code') throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CODE_TAKEN);
      if (duplicate === 'email')
        throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_EMAIL_TAKEN);
      throw error;
    }
    return toEmployeeResponse(saved);
  }

  async deactivate(id: string, actorId?: string): Promise<EmployeeResponse> {
    if (actorId === id) {
      throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CANNOT_DEACTIVATE_SELF);
    }

    const employee = await this.employees.findOne({ where: { id } });
    if (!employee) throw AppRpcException.notFound(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);

    if (!employee.isActive) return toEmployeeResponse(employee);

    employee.isActive = false;
    const saved = await this.employees.save(employee);
    this.logger.log(`Karyawan dinonaktifkan: ${saved.employeeCode}`);
    return toEmployeeResponse(saved);
  }

  private async assertEmailAvailable(email: string, exceptId?: string): Promise<void> {
    const total = await this.employees.count({
      where: exceptId ? { email, id: Not(exceptId) } : { email },
    });
    if (total > 0) throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_EMAIL_TAKEN);
  }

  private async assertCodeAvailable(code?: string, exceptId?: string): Promise<void> {
    const value = code?.trim();
    if (!value) return;
    const total = await this.employees.count({
      where: exceptId ? { employeeCode: value, id: Not(exceptId) } : { employeeCode: value },
    });
    if (total > 0) throw AppRpcException.conflict(ERROR_MESSAGES.EMPLOYEE_CODE_TAKEN);
  }

  /** Hanya pratinjau: kode final tetap dibuat saat create. */
  nextCode(): Promise<{ employeeCode: string }> {
    return this.generateEmployeeCode().then((employeeCode) => ({ employeeCode }));
  }

  private async generateEmployeeCode(startAt = 1): Promise<string> {
    for (let attempt = startAt; attempt <= 9999; attempt += 1) {
      const code = `EMP-${String(attempt).padStart(4, '0')}`;
      const exists = await this.employees.count({ where: { employeeCode: code } });
      if (exists === 0) return code;
    }
    throw AppRpcException.internal('Tidak bisa membuat kode karyawan baru.');
  }

  private codeNumber(code: string): number {
    return Number.parseInt(code.replace(/\D/g, ''), 10) || 0;
  }

  /** Unique index tetap penjaga terakhir saat dua request berjalan bersamaan. */
  private duplicateTarget(error: unknown): 'code' | 'email' | null {
    const driver = (error as { driverError?: { code?: string; message?: string } }).driverError;
    const message = driver?.message ?? (error instanceof Error ? error.message : '');
    const isDuplicate = driver?.code === 'ER_DUP_ENTRY' || message.includes('Duplicate entry');
    if (!isDuplicate) return null;
    if (message.includes('uq_employees_employee_code')) return 'code';
    if (message.includes('uq_employees_email')) return 'email';
    return null;
  }
}

const MAX_CODE_ATTEMPTS = 5;
