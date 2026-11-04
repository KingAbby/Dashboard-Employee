import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendances1762300000100 implements MigrationInterface {
  name = 'CreateAttendances1762300000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attendances (
        id CHAR(36) NOT NULL,
        employee_id CHAR(36) NOT NULL,
        attendance_date DATE NOT NULL,
        check_in_at DATETIME(6) NOT NULL,
        check_in_photo VARCHAR(255) NOT NULL,
        check_out_at DATETIME(6) NULL,
        check_out_photo VARCHAR(255) NULL,
        status ENUM('ON_TIME', 'LATE') NOT NULL,
        note VARCHAR(255) NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_attendances_employee_date (employee_id, attendance_date),
        KEY idx_attendances_employee (employee_id),
        KEY idx_attendances_date (attendance_date),
        KEY idx_attendances_status (status)
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS attendances');
  }
}
