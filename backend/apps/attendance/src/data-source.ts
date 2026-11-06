import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Attendance } from './attendances/entities/attendance.entity';
import { CreateAttendances1762300000100 } from './migrations/1762300000100-create-attendances';

/** DataSource khusus migration & seed; service memakai TypeOrmModule. */
export const attendanceDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_ATTENDANCE_NAME ?? 'hr_attendance',
  entities: [Attendance],
  migrations: [CreateAttendances1762300000100],
  migrationsTableName: 'migrations',
  synchronize: false,
  timezone: 'Z',
  charset: 'utf8mb4',
});
