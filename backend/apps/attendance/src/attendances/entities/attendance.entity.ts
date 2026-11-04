import { AttendanceStatus } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attendances')
export class Attendance {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  /** Referensi biasa ke hr_identity.employees, tanpa foreign key lintas database. */
  @Index('idx_attendances_employee')
  @Column({ name: 'employee_id', type: 'char', length: 36 })
  employeeId!: string;

  /** Tanggal lokal Asia/Jakarta, bukan hasil konversi UTC dari klien. */
  @Index('idx_attendances_date')
  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate!: string;

  @Column({ name: 'check_in_at', type: 'datetime', precision: 6 })
  checkInAt!: Date;

  @Column({ name: 'check_in_photo', type: 'varchar', length: 255 })
  checkInPhoto!: string;

  @Column({ name: 'check_out_at', type: 'datetime', precision: 6, nullable: true })
  checkOutAt!: Date | null;

  @Column({ name: 'check_out_photo', type: 'varchar', length: 255, nullable: true })
  checkOutPhoto!: string | null;

  @Index('idx_attendances_status')
  @Column({ type: 'enum', enum: AttendanceStatus })
  status!: AttendanceStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
