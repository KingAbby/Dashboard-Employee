import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { hashPassword } from '../apps/identity/src/common/password.util';
import { Employee } from '../apps/identity/src/employees/entities/employee.entity';
import { identityDataSource } from '../apps/identity/src/data-source';
import { Attendance } from '../apps/attendance/src/attendances/entities/attendance.entity';
import { attendanceDataSource } from '../apps/attendance/src/data-source';
import { AttendanceStatus, Role } from '@app/common';
import { createSamplePng } from './lib/sample-photo';

const logger = new Logger('Seed');

const SEED_PASSWORD = {
  admin: 'Admin123!',
  employee: 'Employee123!',
};

const SEED_EMPLOYEES = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    employeeCode: 'EMP-0001',
    fullName: 'Rani Prameswari',
    email: 'admin@example.com',
    role: Role.ADMIN_HRD,
    position: 'HR & People Operations Lead',
    department: 'Human Resources',
    phone: '0812-1000-0001',
    joinDate: '2021-02-01',
    password: SEED_PASSWORD.admin,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    employeeCode: 'EMP-0002',
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    role: Role.EMPLOYEE,
    position: 'Frontend Engineer',
    department: 'Engineering',
    phone: '0812-1000-0002',
    joinDate: '2023-03-13',
    password: SEED_PASSWORD.employee,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    employeeCode: 'EMP-0003',
    fullName: 'Sari Wulandari',
    email: 'sari@example.com',
    role: Role.EMPLOYEE,
    position: 'Product Designer',
    department: 'Product',
    phone: '0812-1000-0003',
    joinDate: '2022-08-01',
    password: SEED_PASSWORD.employee,
  },
] as const;

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

const jakartaToday = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.APP_TIMEZONE ?? 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

/** Rentang 7 hari kalender terakhir; akhir pekan dilewati. */
const workingDays = (): string[] => {
  const [year, month, day] = jakartaToday().split('-').map(Number);
  const todayUtc = Date.UTC(year, month - 1, day);
  const days: string[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(todayUtc - offset * 86_400_000);
    const weekday = date.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    days.push(date.toISOString().slice(0, 10));
  }

  return days;
};

const writeSamplePhoto = async (
  attendanceDate: string,
  status: AttendanceStatus,
): Promise<string> => {
  const [year, month] = attendanceDate.split('-');
  const fileName = `${crypto.randomUUID()}.png`;
  const directory = join(UPLOAD_DIR, 'attendance', year, month);
  await mkdir(directory, { recursive: true });

  const color =
    status === AttendanceStatus.ON_TIME ? { r: 22, g: 163, b: 106 } : { r: 224, g: 161, b: 0 };
  await writeFile(join(directory, fileName), createSamplePng(480, 360, color));

  return fileName;
};

const seedIdentity = async (): Promise<{ id: string; isAdmin: boolean }[]> => {
  await identityDataSource.initialize();
  const employees = identityDataSource.getRepository(Employee);
  const seeded: { id: string; isAdmin: boolean }[] = [];

  try {
    for (const seed of SEED_EMPLOYEES) {
      // Cocokkan lewat email, id, ATAU kode. Row yang id/kodenya sama tapi
      // emailnya berbeda berarti data sudah diedit admin — jangan ditimpa.
      const existing = await employees.findOne({
        where: [{ email: seed.email }, { id: seed.id }, { employeeCode: seed.employeeCode }],
      });

      if (existing) {
        if (existing.email === seed.email) {
          logger.log(`Lewati ${seed.email} (sudah ada).`);
          seeded.push({ id: existing.id, isAdmin: seed.role === Role.ADMIN_HRD });
        } else {
          logger.warn(
            `Lewati ${seed.email}: id/kode seed sudah dipakai ${existing.email}. Data itu tidak diubah.`,
          );
        }
        continue;
      }

      // insert (bukan save) supaya tidak mungkin menimpa row lain lewat primary key.
      await employees.insert({
        id: seed.id,
        employeeCode: seed.employeeCode,
        fullName: seed.fullName,
        email: seed.email,
        passwordHash: await hashPassword(seed.password),
        role: seed.role,
        position: seed.position,
        department: seed.department,
        phone: seed.phone,
        joinDate: seed.joinDate,
        isActive: true,
      });
      logger.log(`Karyawan dibuat: ${seed.employeeCode} ${seed.fullName}`);
      seeded.push({ id: seed.id, isAdmin: seed.role === Role.ADMIN_HRD });
    }
  } finally {
    await identityDataSource.destroy();
  }

  return seeded;
};

const seedAttendance = async (employeeIds: string[]): Promise<void> => {
  if (employeeIds.length === 0) {
    logger.log('Tidak ada karyawan seed yang cocok, absensi contoh dilewati.');
    return;
  }

  await attendanceDataSource.initialize();
  const attendances = attendanceDataSource.getRepository(Attendance);

  try {
    const days = workingDays();

    for (const [employeeIndex, employeeId] of employeeIds.entries()) {
      for (const [dayIndex, attendanceDate] of days.entries()) {
        const existing = await attendances.findOne({
          where: { employeeId, attendanceDate },
        });
        if (existing) continue;

        // Pola tetap: sebagian besar tepat waktu, sisanya terlambat.
        const late = (dayIndex + employeeIndex) % 4 === 1;
        const status = late ? AttendanceStatus.LATE : AttendanceStatus.ON_TIME;

        const [year, month, day] = attendanceDate.split('-').map(Number);
        const minuteOffset = (employeeIndex * 7 + dayIndex * 11) % 35;
        const checkInHourUtc = late ? 2 : 1; // 09:xx / 08:xx WIB
        const checkInMinuteUtc = (late ? 10 : 0) + minuteOffset;

        const checkInAt = new Date(
          Date.UTC(year, month - 1, day, checkInHourUtc, checkInMinuteUtc, 0),
        );
        const checkOutAt = new Date(
          Date.UTC(year, month - 1, day, 9, 5 + minuteOffset, 0), // 16:xx WIB
        );

        await attendances.save(
          attendances.create({
            id: crypto.randomUUID(),
            employeeId,
            attendanceDate,
            checkInAt,
            checkInPhoto: await writeSamplePhoto(attendanceDate, status),
            checkOutAt,
            checkOutPhoto: await writeSamplePhoto(attendanceDate, status),
            status,
            note: null,
          }),
        );
      }
    }

    logger.log(`Data absensi contoh siap untuk ${days.length} hari kerja.`);
  } finally {
    await attendanceDataSource.destroy();
  }
};

const run = async (): Promise<void> => {
  const seeded = await seedIdentity();
  await seedAttendance(
    seeded.filter((employee) => !employee.isAdmin).map((employee) => employee.id),
  );
  logger.log('Seed selesai.');
};

run().catch((error) => {
  logger.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
