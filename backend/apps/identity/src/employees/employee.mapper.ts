import type { EmployeeResponse } from '@app/common';
import type { Employee } from './entities/employee.entity';

export const toEmployeeResponse = (employee: Employee): EmployeeResponse => ({
  id: employee.id,
  employeeCode: employee.employeeCode,
  fullName: employee.fullName,
  email: employee.email,
  role: employee.role,
  position: employee.position,
  department: employee.department,
  phone: employee.phone,
  joinDate: employee.joinDate,
  isActive: employee.isActive,
  createdAt: employee.createdAt,
  updatedAt: employee.updatedAt,
});
