import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployees1762300000000 implements MigrationInterface {
  name = 'CreateEmployees1762300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id CHAR(36) NOT NULL,
        employee_code VARCHAR(20) NOT NULL,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('EMPLOYEE', 'ADMIN_HRD') NOT NULL DEFAULT 'EMPLOYEE',
        position VARCHAR(100) NULL,
        department VARCHAR(100) NULL,
        phone VARCHAR(30) NULL,
        join_date DATE NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_employees_employee_code (employee_code),
        UNIQUE KEY uq_employees_email (email),
        KEY idx_employees_is_active (is_active),
        KEY idx_employees_full_name (full_name)
      ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS employees');
  }
}
