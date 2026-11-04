import { AttendanceStatus, ERROR_MESSAGES, type CheckInPayloadDto } from '@app/common';
import { jest } from '@jest/globals';
import type { ConfigService } from '@nestjs/config';
import type { Repository } from 'typeorm';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';

const EMPLOYEE_ID = '22222222-2222-4222-8222-222222222222';

const buildAttendance = (overrides: Partial<Attendance> = {}): Attendance =>
  ({
    id: '11111111-1111-4111-8111-111111111111',
    employeeId: EMPLOYEE_ID,
    attendanceDate: '2026-11-04',
    checkInAt: new Date('2026-11-04T01:30:00.000Z'),
    checkInPhoto: 'foto-masuk.jpg',
    checkOutAt: null,
    checkOutPhoto: null,
    status: AttendanceStatus.ON_TIME,
    note: null,
    createdAt: new Date('2026-11-04T01:30:00.000Z'),
    updatedAt: new Date('2026-11-04T01:30:00.000Z'),
    ...overrides,
  }) as Attendance;

const buildConfig = () =>
  ({
    get: (key: string, fallback?: string) =>
      ({
        APP_TIMEZONE: 'Asia/Jakarta',
        WORK_START_TIME: '09:00',
        LATE_TOLERANCE_MINUTES: '0',
      })[key] ?? fallback,
  }) as unknown as ConfigService;

const buildRepository = () => {
  const mock = {
    findOne: jest.fn<() => Promise<Attendance | null>>(async () => null),
    save: jest.fn<(entity: Attendance) => Promise<Attendance>>(async (entity) => entity),
    // TypeORM mengisi createdAt/updatedAt saat save; di test diisi default fixture.
    create: jest.fn<(input: Partial<Attendance>) => Attendance>((input) => buildAttendance(input)),
  };

  return { repository: mock as unknown as Repository<Attendance>, mock };
};

const payload = (overrides: Partial<CheckInPayloadDto> = {}): CheckInPayloadDto => ({
  employeeId: EMPLOYEE_ID,
  photo: 'foto.jpg',
  ...overrides,
});

describe('AttendancesService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkIn', () => {
    it('mencatat ON_TIME bila masuk sebelum jam kerja (08:30 WIB)', async () => {
      jest.setSystemTime(new Date('2026-11-04T01:30:00.000Z'));
      const { repository } = buildRepository();
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.checkIn(payload());

      expect(result.status).toBe(AttendanceStatus.ON_TIME);
      expect(result.attendanceDate).toBe('2026-11-04');
    });

    it('mencatat LATE bila melewati jam kerja (09:15 WIB)', async () => {
      jest.setSystemTime(new Date('2026-11-04T02:15:00.000Z'));
      const { repository } = buildRepository();
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.checkIn(payload());

      expect(result.status).toBe(AttendanceStatus.LATE);
    });

    it('memakai tanggal Asia/Jakarta, bukan UTC', async () => {
      // 2026-11-04 23:30 UTC = 2026-11-05 06:30 WIB
      jest.setSystemTime(new Date('2026-11-04T23:30:00.000Z'));
      const { repository, mock } = buildRepository();
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.checkIn(payload());

      expect(result.attendanceDate).toBe('2026-11-05');
      expect(mock.save).toHaveBeenCalledWith(
        expect.objectContaining({ attendanceDate: '2026-11-05' }),
      );
    });

    it('menolak absen kedua pada hari yang sama', async () => {
      jest.setSystemTime(new Date('2026-11-04T01:30:00.000Z'));
      const { repository, mock } = buildRepository();
      mock.findOne.mockResolvedValue(buildAttendance());
      const service = new AttendancesService(repository, buildConfig());

      await expect(service.checkIn(payload())).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.ATTENDANCE_ALREADY_CHECKED_IN },
      });
      expect(mock.save).not.toHaveBeenCalled();
    });
  });

  describe('checkOut', () => {
    it('menolak absen pulang bila belum absen masuk', async () => {
      jest.setSystemTime(new Date('2026-11-04T09:00:00.000Z'));
      const { repository } = buildRepository();
      const service = new AttendancesService(repository, buildConfig());

      await expect(service.checkOut(payload())).rejects.toMatchObject({
        error: { statusCode: 400, message: ERROR_MESSAGES.ATTENDANCE_NOT_CHECKED_IN },
      });
    });

    it('menolak absen pulang kedua kali', async () => {
      jest.setSystemTime(new Date('2026-11-04T09:00:00.000Z'));
      const { repository, mock } = buildRepository();
      mock.findOne.mockResolvedValue(
        buildAttendance({ checkOutAt: new Date('2026-11-04T09:00:00.000Z') }),
      );
      const service = new AttendancesService(repository, buildConfig());

      await expect(service.checkOut(payload())).rejects.toMatchObject({
        error: { statusCode: 409, message: ERROR_MESSAGES.ATTENDANCE_ALREADY_CHECKED_OUT },
      });
    });

    it('mengisi check_out_at dan foto pulang', async () => {
      jest.setSystemTime(new Date('2026-11-04T09:00:00.000Z'));
      const { repository, mock } = buildRepository();
      mock.findOne.mockResolvedValue(buildAttendance());
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.checkOut({ employeeId: EMPLOYEE_ID, photo: 'foto-pulang.jpg' });

      expect(result.checkOutAt).toBe('2026-11-04T09:00:00.000Z');
      expect(result.checkOutPhoto).toBe('foto-pulang.jpg');
    });
  });

  describe('today', () => {
    it('mengembalikan null bila belum absen', async () => {
      jest.setSystemTime(new Date('2026-11-04T01:00:00.000Z'));
      const { repository } = buildRepository();
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.today(EMPLOYEE_ID);

      expect(result.attendance).toBeNull();
      expect(result.date).toBe('2026-11-04');
      expect(result.workStartTime).toBe('09:00');
    });
  });
});
