import {
  AppRpcException,
  AttendanceStatus,
  DEFAULT_TIMEZONE,
  ERROR_MESSAGES,
  buildPaginated,
  isLateCheckIn,
  parseTimeToMinutes,
  toZonedParts,
  type AttendanceDayCountsResponse,
  type AttendanceResponse,
  type CheckInPayloadDto,
  type CheckOutPayloadDto,
  type ListAttendancesQueryDto,
  type MyAttendancesQueryDto,
  type Paginated,
  type TodayAttendanceResponse,
} from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { toAttendanceResponse } from './attendance.mapper';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendances: Repository<Attendance>,
    private readonly config: ConfigService,
  ) {}

  async checkIn(payload: CheckInPayloadDto): Promise<AttendanceResponse> {
    const now = new Date();
    const zoned = toZonedParts(now, this.timezone);

    const existing = await this.attendances.findOne({
      where: { employeeId: payload.employeeId, attendanceDate: zoned.date },
    });
    if (existing) {
      throw AppRpcException.conflict(ERROR_MESSAGES.ATTENDANCE_ALREADY_CHECKED_IN);
    }

    const late = isLateCheckIn(zoned.minutes, this.workStartMinutes, this.lateToleranceMinutes);

    let saved: Attendance;
    try {
      saved = await this.attendances.save(
        this.attendances.create({
          id: randomUUID(),
          employeeId: payload.employeeId,
          attendanceDate: zoned.date,
          checkInAt: now,
          checkInPhoto: payload.photo,
          status: late ? AttendanceStatus.LATE : AttendanceStatus.ON_TIME,
          note: payload.note?.trim() || null,
        }),
      );
    } catch (error) {
      if (this.isDuplicateAttendance(error)) {
        throw AppRpcException.conflict(ERROR_MESSAGES.ATTENDANCE_ALREADY_CHECKED_IN);
      }
      throw error;
    }

    return toAttendanceResponse(saved);
  }

  async checkOut(payload: CheckOutPayloadDto): Promise<AttendanceResponse> {
    const now = new Date();
    const zoned = toZonedParts(now, this.timezone);

    const attendance = await this.attendances.findOne({
      where: { employeeId: payload.employeeId, attendanceDate: zoned.date },
    });
    if (!attendance) {
      throw AppRpcException.badRequest(ERROR_MESSAGES.ATTENDANCE_NOT_CHECKED_IN);
    }
    if (attendance.checkOutAt) {
      throw AppRpcException.conflict(ERROR_MESSAGES.ATTENDANCE_ALREADY_CHECKED_OUT);
    }
    if (zoned.minutes < this.workEndMinutes) {
      throw AppRpcException.badRequest(
        `Absen pulang baru bisa dilakukan pukul ${this.workEndTime} WIB.`,
      );
    }

    attendance.checkOutAt = now;
    attendance.checkOutPhoto = payload.photo;
    if (payload.note?.trim()) attendance.note = payload.note.trim();

    return toAttendanceResponse(await this.attendances.save(attendance));
  }

  async today(employeeId: string): Promise<TodayAttendanceResponse> {
    const now = new Date();
    const zoned = toZonedParts(now, this.timezone);

    const attendance = await this.attendances.findOne({
      where: { employeeId, attendanceDate: zoned.date },
    });

    return {
      date: zoned.date,
      serverTime: now.toISOString(),
      workStartTime: this.workStartTime,
      workEndTime: this.workEndTime,
      lateToleranceMinutes: this.lateToleranceMinutes,
      attendance: attendance ? toAttendanceResponse(attendance) : null,
    };
  }

  async listMine(query: MyAttendancesQueryDto): Promise<Paginated<AttendanceResponse>> {
    this.assertDateRange(query.dateFrom, query.dateTo);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.attendances
      .createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', { employeeId: query.employeeId });

    if (query.dateFrom) {
      qb.andWhere('attendance.attendance_date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('attendance.attendance_date <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('attendance.attendance_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return buildPaginated(rows.map(toAttendanceResponse), page, limit, total);
  }

  async findOne(id: string): Promise<AttendanceResponse> {
    const attendance = await this.attendances.findOne({ where: { id } });
    if (!attendance) throw AppRpcException.notFound(ERROR_MESSAGES.ATTENDANCE_NOT_FOUND);
    return toAttendanceResponse(attendance);
  }

  /**
   * Daftar absensi semua karyawan untuk admin HRD (view only).
   * Nama karyawan tidak disimpan di sini; gateway yang menggabungkannya.
   */
  async listAll(query: ListAttendancesQueryDto): Promise<Paginated<AttendanceResponse>> {
    this.assertDateRange(query.dateFrom, query.dateTo);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.attendances.createQueryBuilder('attendance');

    if (query.dateFrom) {
      qb.andWhere('attendance.attendance_date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('attendance.attendance_date <= :dateTo', { dateTo: query.dateTo });
    }
    if (query.employeeIds?.length) {
      qb.andWhere('attendance.employee_id IN (:...employeeIds)', {
        employeeIds: query.employeeIds,
      });
    } else if (query.employeeId) {
      qb.andWhere('attendance.employee_id = :employeeId', { employeeId: query.employeeId });
    }
    if (query.status) {
      qb.andWhere('attendance.status = :status', { status: query.status });
    }

    qb.orderBy('attendance.attendance_date', 'DESC')
      .addOrderBy('attendance.check_in_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return buildPaginated(rows.map(toAttendanceResponse), page, limit, total);
  }

  async summary(): Promise<AttendanceDayCountsResponse> {
    const date = toZonedParts(new Date(), this.timezone).date;

    const [present, late, checkedOut] = await Promise.all([
      this.attendances.count({ where: { attendanceDate: date } }),
      this.attendances.count({ where: { attendanceDate: date, status: AttendanceStatus.LATE } }),
      this.attendances
        .createQueryBuilder('attendance')
        .where('attendance.attendance_date = :date', { date })
        .andWhere('attendance.check_out_at IS NOT NULL')
        .getCount(),
    ]);

    return { date, present, onTime: present - late, late, checkedOut };
  }

  private assertDateRange(dateFrom?: string, dateTo?: string): void {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw AppRpcException.badRequest('Tanggal mulai tidak boleh setelah tanggal akhir.');
    }
  }

  private isDuplicateAttendance(error: unknown): boolean {
    const driver = (error as { driverError?: { code?: string; message?: string } }).driverError;
    return (
      driver?.code === 'ER_DUP_ENTRY' &&
      Boolean(driver.message?.includes('uq_attendances_employee_date'))
    );
  }

  private get timezone(): string {
    return this.config.get<string>('APP_TIMEZONE', DEFAULT_TIMEZONE);
  }

  private get workStartTime(): string {
    return this.config.get<string>('WORK_START_TIME', '09:00');
  }

  private get workStartMinutes(): number {
    return parseTimeToMinutes(this.workStartTime);
  }

  private get workEndTime(): string {
    return this.config.get<string>('WORK_END_TIME', '17:00');
  }

  private get workEndMinutes(): number {
    return parseTimeToMinutes(this.workEndTime);
  }

  private get lateToleranceMinutes(): number {
    return Number(this.config.get<string>('LATE_TOLERANCE_MINUTES', '0'));
  }
}
