import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { createConnection } from 'mysql2/promise';
import { attendanceDataSource } from '../apps/attendance/src/data-source';
import { identityDataSource } from '../apps/identity/src/data-source';

const logger = new Logger('Migrate');

async function ensureDatabases(): Promise<void> {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const databases = [
    process.env.DB_IDENTITY_NAME ?? 'hr_identity',
    process.env.DB_ATTENDANCE_NAME ?? 'hr_attendance',
  ];

  const connection = await createConnection({ host, port, user, password });
  try {
    for (const database of databases) {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      logger.log(`Database siap: ${database}`);
    }
  } finally {
    await connection.end();
  }
}

async function run(): Promise<void> {
  await ensureDatabases();

  for (const [name, dataSource] of [
    ['hr_identity', identityDataSource],
    ['hr_attendance', attendanceDataSource],
  ] as const) {
    await dataSource.initialize();
    try {
      const executed = await dataSource.runMigrations();
      logger.log(
        executed.length > 0
          ? `${name}: ${executed.length} migration dijalankan (${executed.map((m) => m.name).join(', ')})`
          : `${name}: tidak ada migration baru`,
      );
    } finally {
      await dataSource.destroy();
    }
  }
}

run().catch((error) => {
  logger.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
