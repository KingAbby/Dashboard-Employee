import { Role } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Index('uq_employees_employee_code', { unique: true })
  @Column({ name: 'employee_code', type: 'varchar', length: 20 })
  employeeCode!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Index('uq_employees_email', { unique: true })
  @Column({ type: 'varchar', length: 150 })
  email!: string;

  /** Tidak pernah ikut terambil kecuali diminta eksplisit (login). */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role!: Role;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ name: 'join_date', type: 'date', nullable: true })
  joinDate!: string | null;

  @Index('idx_employees_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
