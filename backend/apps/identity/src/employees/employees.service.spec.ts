import { ERROR_MESSAGES, Role } from '@app/common';
import { jest } from '@jest/globals';
import type { Repository } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

const buildEmployee = (overrides: Partial<Employee> = {}): Employee =>
  ({
    id: '22222222-2222-4222-8222-222222222222',
    employeeCode: 'EMP-0002',
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    passwordHash: 'hash',
    role: Role.EMPLOYEE,
    position: 'Frontend Engineer',
    department: 'Engineering',
    phone: null,
    joinDate: '2023-03-13',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Employee;

const buildRepository = () => {
  const repository = {
    count: jest.fn(async () => 0),
    findOne: jest.fn(async (): Promise<Employee | null> => null),
    save: jest.fn(async (employee: Employee) => employee),
    create: jest.fn((input: Partial<Employee>) => input as Employee),
    createQueryBuilder: jest.fn(),
  };

  return repository as unknown as Repository<Employee> & typeof repository;
};

describe('EmployeesService', () => {
  describe('deactivate', () => {
    it('menolak admin menonaktifkan akunnya sendiri', async () => {
      const repository = buildRepository();
      const service = new EmployeesService(repository);
      const admin = buildEmployee({ role: Role.ADMIN_HRD });

      await expect(service.deactivate(admin.id, admin.id)).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.EMPLOYEE_CANNOT_DEACTIVATE_SELF },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('menonaktifkan tanpa menghapus baris (soft delete)', async () => {
      const repository = buildRepository();
      repository.findOne.mockResolvedValue(buildEmployee());
      const service = new EmployeesService(repository);

      const result = await service.deactivate('22222222-2222-4222-8222-222222222222', 'admin-id');

      expect(result.isActive).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });

    it('mengembalikan 404 bila karyawan tidak ada', async () => {
      const repository = buildRepository();
      repository.findOne.mockResolvedValue(null);
      const service = new EmployeesService(repository);

      await expect(service.deactivate('tidak-ada', 'admin-id')).rejects.toMatchObject({
        error: { statusCode: 404 },
      });
    });
  });

  describe('update', () => {
    it('menolak admin mengubah role akunnya sendiri', async () => {
      const repository = buildRepository();
      const admin = buildEmployee({ role: Role.ADMIN_HRD });
      repository.findOne.mockResolvedValue(admin);
      const service = new EmployeesService(repository);

      await expect(
        service.update(admin.id, { role: Role.EMPLOYEE }, admin.id),
      ).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.EMPLOYEE_CANNOT_CHANGE_OWN_ROLE },
      });
    });
  });

  describe('create', () => {
    it('menolak email yang sudah dipakai', async () => {
      const repository = buildRepository();
      repository.count.mockResolvedValue(1);
      const service = new EmployeesService(repository);

      await expect(
        service.create({
          fullName: 'Budi Baru',
          email: 'budi@example.com',
          password: 'Rahasia123!',
        }),
      ).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.EMPLOYEE_EMAIL_TAKEN },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('membuat kode karyawan otomatis bila tidak diisi', async () => {
      const repository = buildRepository();
      const service = new EmployeesService(repository);

      const created = await service.create({
        fullName: 'Sari Baru',
        email: 'sari.baru@example.com',
        password: 'Rahasia123!',
      });

      expect(created.employeeCode).toBe('EMP-0001');
      expect(created.role).toBe(Role.EMPLOYEE);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('mengulang dengan kode berikutnya saat bentrok (dua admin bersamaan)', async () => {
      const repository = buildRepository();
      repository.save.mockRejectedValueOnce({
        driverError: {
          code: 'ER_DUP_ENTRY',
          message: "Duplicate entry 'EMP-0001' for key 'employees.uq_employees_employee_code'",
        },
      });
      const service = new EmployeesService(repository);

      const created = await service.create({
        fullName: 'Karyawan Bersamaan',
        email: 'race@example.com',
        password: 'Rahasia123!',
      });

      expect(created.employeeCode).toBe('EMP-0002');
      expect(repository.save).toHaveBeenCalledTimes(2);
    });

    it('menolak kode manual yang bentrok karena balapan', async () => {
      const repository = buildRepository();
      repository.save.mockRejectedValueOnce({
        driverError: {
          code: 'ER_DUP_ENTRY',
          message: "Duplicate entry 'EMP-0100' for key 'employees.uq_employees_employee_code'",
        },
      });
      const service = new EmployeesService(repository);

      await expect(
        service.create({
          employeeCode: 'EMP-0100',
          fullName: 'Karyawan Manual',
          email: 'manual@example.com',
          password: 'Rahasia123!',
        }),
      ).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.EMPLOYEE_CODE_TAKEN },
      });
    });
  });

  describe('nextCode', () => {
    it('memberi pratinjau kode berikutnya tanpa menyimpan', async () => {
      const repository = buildRepository();
      repository.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      const service = new EmployeesService(repository);

      await expect(service.nextCode()).resolves.toEqual({ employeeCode: 'EMP-0002' });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('membentuk metadata pagination dari total data', async () => {
      const repository = buildRepository();
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[buildEmployee()], 21]),
      };
      repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
      const service = new EmployeesService(repository);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({ page: 2, limit: 10, total: 21, totalPages: 3 });
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    });
  });
});
