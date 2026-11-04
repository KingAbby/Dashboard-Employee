import {
  MESSAGE_PATTERNS,
  type AttendanceResponse,
  type ListMyAttendancesQueryDto,
  type Paginated,
  type TodayAttendanceResponse,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ATTENDANCE_CLIENT } from '../clients/clients.module';

@Injectable()
export class AttendanceService {
  constructor(@Inject(ATTENDANCE_CLIENT) private readonly attendance: ClientProxy) {}

  today(employeeId: string): Promise<TodayAttendanceResponse> {
    return this.send<TodayAttendanceResponse>(MESSAGE_PATTERNS.ATTENDANCE_TODAY, { employeeId });
  }

  checkIn(employeeId: string, photo: string, note?: string): Promise<AttendanceResponse> {
    return this.send<AttendanceResponse>(MESSAGE_PATTERNS.ATTENDANCE_CHECK_IN, {
      employeeId,
      photo,
      note,
    });
  }

  checkOut(employeeId: string, photo: string, note?: string): Promise<AttendanceResponse> {
    return this.send<AttendanceResponse>(MESSAGE_PATTERNS.ATTENDANCE_CHECK_OUT, {
      employeeId,
      photo,
      note,
    });
  }

  listMine(
    employeeId: string,
    query: ListMyAttendancesQueryDto,
  ): Promise<Paginated<AttendanceResponse>> {
    return this.send<Paginated<AttendanceResponse>>(MESSAGE_PATTERNS.ATTENDANCE_LIST_ME, {
      employeeId,
      page: query.page,
      limit: query.limit,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  /** Dipakai endpoint foto untuk memeriksa pemilik sebelum mengirim file. */
  detail(id: string): Promise<AttendanceResponse> {
    return this.send<AttendanceResponse>(MESSAGE_PATTERNS.ATTENDANCE_GET, { id });
  }

  private send<T>(pattern: string, payload: unknown): Promise<T> {
    return firstValueFrom(this.attendance.send<T>(pattern, payload));
  }
}
