import { DataSource } from 'typeorm';
import { Employee } from './employees/entities/employee.entity';
import { CreateEmployees1762300000000 } from './migrations/1762300000000-create-employees';

export const identityDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_IDENTITY_NAME ?? 'hr_identity',
  entities: [Employee],
  migrations: [CreateEmployees1762300000000],
  migrationsTableName: 'migrations',
  synchronize: false,
  timezone: 'Z',
  charset: 'utf8mb4',
});
