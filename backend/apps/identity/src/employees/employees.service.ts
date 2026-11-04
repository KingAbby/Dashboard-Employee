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

    const employee = this.employees.create({
      id: randomUUID(),
      employeeCode: dto.employeeCode?.trim() || (await this.generateEmployeeCode()),
      fullName: dto.fullName.trim(),
      email,
      passwordHash: await hashPassword(dto.password),
      role: dto.role ?? Role.EMPLOYEE,
      position: emptyToNull(dto.position),
      department: emptyToNull(dto.department),
      phone: emptyToNull(dto.phone),
      joinDate: emptyToNull(dto.joinDate),
      isActive: dto.isActive ?? true,
    });

    const saved = await this.employees.save(employee);
    this.logger.log(`Karyawan dibuat: ${saved.employeeCode}`);
    return toEmployeeResponse(saved);
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

    if (dto.email && dto.email.trim().toLowerCase() !== employee.email) {
      const email = dto.email.trim().toLowerCase();
      await this.assertEmailAvailable(email, id);
      employee.email = email;
    }

    if (dto.employeeCode && dto.employeeCode.trim() !== employee.employeeCode) {
      const code = dto.employeeCode.trim();
      await this.assertCodeAvailable(code, id);
      employee.employeeCode = code;
    }

    if (dto.fullName !== undefined) employee.fullName = dto.fullName.trim();
    if (dto.role !== undefined) employee.role = dto.role;
    if (dto.position !== undefined) employee.position = emptyToNull(dto.position);
    if (dto.department !== undefined) employee.department = emptyToNull(dto.department);
    if (dto.phone !== undefined) employee.phone = emptyToNull(dto.phone);
    if (dto.joinDate !== undefined) employee.joinDate = emptyToNull(dto.joinDate);
    if (dto.isActive !== undefined) employee.isActive = dto.isActive;
    if (dto.password) employee.passwordHash = await hashPassword(dto.password);

    const saved = await this.employees.save(employee);
    return toEmployeeResponse(saved);
  }

  /** Soft delete: baris tetap ada karena riwayat absensi harus bisa ditelusuri. */
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

  /** EMP-0001, EMP-0002, ... Melewati nomor yang sudah terpakai. */
  private async generateEmployeeCode(): Promise<string> {
    for (let attempt = 1; attempt <= 9999; attempt += 1) {
      const code = `EMP-${String(attempt).padStart(4, '0')}`;
      const exists = await this.employees.count({ where: { employeeCode: code } });
      if (exists === 0) return code;
    }
    throw AppRpcException.internal('Tidak bisa membuat kode karyawan baru.');
  }
}
