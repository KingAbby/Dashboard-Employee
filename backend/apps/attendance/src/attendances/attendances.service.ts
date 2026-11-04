import {
  AppRpcException,
  AttendanceStatus,
  DEFAULT_TIMEZONE,
  ERROR_MESSAGES,
  buildPaginated,
  isLateCheckIn,
  parseTimeToMinutes,
  toZonedParts,
  type AttendanceResponse,
  type CheckInPayloadDto,
  type CheckOutPayloadDto,
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

  /** Absen masuk: waktu dari server, satu record per karyawan per hari. */
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

    const saved = await this.attendances.save(
      this.attendances.create({
        id: randomUUID(),
        employeeId: payload.employeeId,
        attendanceDate: zoned.date,
        checkInAt: now,
        checkInPhoto: payload.photo,
        status: late ? AttendanceStatus.LATE : AttendanceStatus.ON_TIME,
        note: payload.note ?? null,
      }),
    );

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

    attendance.checkOutAt = now;
    attendance.checkOutPhoto = payload.photo;
    if (payload.note) attendance.note = payload.note;

    return toAttendanceResponse(await this.attendances.save(attendance));
  }

  /** Status hari ini + jam server, dipakai halaman /absen. */
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
      lateToleranceMinutes: this.lateToleranceMinutes,
      attendance: attendance ? toAttendanceResponse(attendance) : null,
    };
  }

  async listMine(query: MyAttendancesQueryDto): Promise<Paginated<AttendanceResponse>> {
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

  /** Dipakai gateway untuk memeriksa pemilik sebelum mengirim file foto. */
  async findOne(id: string): Promise<AttendanceResponse> {
    const attendance = await this.attendances.findOne({ where: { id } });
    if (!attendance) throw AppRpcException.notFound(ERROR_MESSAGES.ATTENDANCE_NOT_FOUND);
    return toAttendanceResponse(attendance);
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

  private get lateToleranceMinutes(): number {
    return Number(this.config.get<string>('LATE_TOLERANCE_MINUTES', '0'));
  }
}
