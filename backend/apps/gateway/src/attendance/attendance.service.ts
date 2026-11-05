import {
  MESSAGE_PATTERNS,
  type AdminAttendanceResponse,
  type AttendanceDayCountsResponse,
  type AttendanceEmployeeSummary,
  type AttendanceResponse,
  type AttendanceSummaryResponse,
  type EmployeeResponse,
  type ListAttendancesQueryDto,
  type ListMyAttendancesQueryDto,
  type Paginated,
  type TodayAttendanceResponse,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ATTENDANCE_CLIENT } from '../clients/clients.module';
import { EmployeesService } from '../employees/employees.service';

/**
 * Potongan data karyawan yang boleh ikut di daftar absensi admin.
 * Email dan nomor telepon tidak diperlukan di halaman monitoring.
 */
const toEmployeeSummary = (employee?: EmployeeResponse): AttendanceEmployeeSummary | null =>
  employee
    ? {
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        position: employee.position,
        department: employee.department,
        isActive: employee.isActive,
      }
    : null;

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(ATTENDANCE_CLIENT) private readonly attendance: ClientProxy,
    private readonly employees: EmployeesService,
  ) {}

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

  /**
   * Monitoring admin: ambil absensi dari attendance service, lalu tempelkan
   * nama karyawan dari identity service dalam satu panggilan tambahan.
   */
  async list(query: ListAttendancesQueryDto): Promise<Paginated<AdminAttendanceResponse>> {
    const page = await this.send<Paginated<AttendanceResponse>>(
      MESSAGE_PATTERNS.ATTENDANCE_LIST,
      query,
    );

    const employeeIds = [...new Set(page.data.map((item) => item.employeeId))];
    const employees = await this.employees.findMany(employeeIds);
    const byId = new Map(employees.map((employee) => [employee.id, employee]));

    return {
      ...page,
      data: page.data.map((item) => ({
        ...item,
        employee: toEmployeeSummary(byId.get(item.employeeId)),
      })),
    };
  }

  /** Ringkasan harian untuk kartu dashboard admin. */
  async summary(): Promise<AttendanceSummaryResponse> {
    const [counts, activeEmployees] = await Promise.all([
      this.send<AttendanceDayCountsResponse>(MESSAGE_PATTERNS.ATTENDANCE_SUMMARY, {}),
      this.employees.list({ page: 1, limit: 1, isActive: true }),
    ]);

    return {
      ...counts,
      totalActiveEmployees: activeEmployees.meta.total,
      notCheckedIn: Math.max(activeEmployees.meta.total - counts.present, 0),
    };
  }

  /** Dipakai endpoint foto untuk memeriksa pemilik sebelum mengirim file. */
  detail(id: string): Promise<AttendanceResponse> {
    return this.send<AttendanceResponse>(MESSAGE_PATTERNS.ATTENDANCE_GET, { id });
  }

  private send<T>(pattern: string, payload: unknown): Promise<T> {
    return firstValueFrom(this.attendance.send<T>(pattern, payload));
  }
}
