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

const buildRepository = (queryBuilder?: ReturnType<typeof buildQueryBuilder>) => {
  const mock = {
    findOne: jest.fn<() => Promise<Attendance | null>>(async () => null),
    save: jest.fn<(entity: Attendance) => Promise<Attendance>>(async (entity) => entity),
    // TypeORM mengisi createdAt/updatedAt saat save; di test diisi default fixture.
    create: jest.fn<(input: Partial<Attendance>) => Attendance>((input) => buildAttendance(input)),
    count: jest.fn<(options?: unknown) => Promise<number>>(async () => 0),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  return { repository: mock as unknown as Repository<Attendance>, mock };
};

/** Query builder rantai minimal untuk listAll() dan summary(). */
const buildQueryBuilder = (rows: Attendance[], total: number) => {
  const qb = {
    where: jest.fn(() => qb),
    andWhere: jest.fn(() => qb),
    orderBy: jest.fn(() => qb),
    addOrderBy: jest.fn(() => qb),
    skip: jest.fn(() => qb),
    take: jest.fn(() => qb),
    getManyAndCount: jest.fn<() => Promise<[Attendance[], number]>>(async () => [rows, total]),
    getCount: jest.fn<() => Promise<number>>(async () => total),
  };

  return qb;
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

    it('menolak absen pulang sebelum jam pulang', async () => {
      jest.setSystemTime(new Date('2026-11-04T08:00:00.000Z'));
      const { repository, mock } = buildRepository();
      mock.findOne.mockResolvedValue(buildAttendance());
      const service = new AttendancesService(repository, buildConfig());

      await expect(service.checkOut(payload())).rejects.toMatchObject({
        error: {
          statusCode: 400,
          message: 'Absen pulang baru bisa dilakukan pukul 17:00 WIB.',
        },
      });
    });

    it('mengisi check_out_at dan foto pulang', async () => {
      jest.setSystemTime(new Date('2026-11-04T10:00:00.000Z'));
      const { repository, mock } = buildRepository();
      mock.findOne.mockResolvedValue(buildAttendance());
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.checkOut({ employeeId: EMPLOYEE_ID, photo: 'foto-pulang.jpg' });

      expect(result.checkOutAt).toBe('2026-11-04T10:00:00.000Z');
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
      expect(result.workEndTime).toBe('17:00');
    });
  });

  describe('listAll', () => {
    it('meneruskan filter tanggal, karyawan, dan status ke query', async () => {
      const qb = buildQueryBuilder([buildAttendance()], 11);
      const { repository } = buildRepository(qb);
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.listAll({
        page: 2,
        limit: 5,
        dateFrom: '2026-11-01',
        dateTo: '2026-11-04',
        employeeId: EMPLOYEE_ID,
        status: AttendanceStatus.LATE,
      });

      expect(qb.andWhere).toHaveBeenCalledTimes(4);
      expect(qb.skip).toHaveBeenCalledWith(5);
      expect(qb.take).toHaveBeenCalledWith(5);
      expect(result.meta).toEqual({ page: 2, limit: 5, total: 11, totalPages: 3 });
      expect(result.data).toHaveLength(1);
    });

    it('tanpa filter tetap memakai urutan terbaru dan pagination default', async () => {
      const qb = buildQueryBuilder([], 0);
      const { repository } = buildRepository(qb);
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.listAll({ page: undefined, limit: undefined } as never);

      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('attendance.attendance_date', 'DESC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(result.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });
  });

  describe('summary', () => {
    it('menghitung hadir, terlambat, dan sudah pulang untuk tanggal WIB hari ini', async () => {
      // 2026-11-04 02:00 UTC = 09:00 WIB
      jest.setSystemTime(new Date('2026-11-04T02:00:00.000Z'));
      const qb = buildQueryBuilder([], 3);
      const { repository, mock } = buildRepository(qb);
      mock.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
      const service = new AttendancesService(repository, buildConfig());

      const result = await service.summary();

      expect(result).toEqual({
        date: '2026-11-04',
        present: 5,
        onTime: 3,
        late: 2,
        checkedOut: 3,
      });
      expect(mock.count).toHaveBeenNthCalledWith(1, {
        where: { attendanceDate: '2026-11-04' },
      });
    });
  });
});
