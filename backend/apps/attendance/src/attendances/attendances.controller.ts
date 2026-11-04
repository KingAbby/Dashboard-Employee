import {
  MESSAGE_PATTERNS,
  type AttendanceIdPayloadDto,
  type AttendanceResponse,
  type CheckInPayloadDto,
  type CheckOutPayloadDto,
  type EmployeeTodayPayloadDto,
  type MyAttendancesQueryDto,
} from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendancesService } from './attendances.service';

@Controller()
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @MessagePattern(MESSAGE_PATTERNS.ATTENDANCE_TODAY)
  today(@Payload() payload: EmployeeTodayPayloadDto) {
    return this.attendancesService.today(payload.employeeId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ATTENDANCE_CHECK_IN)
  checkIn(@Payload() payload: CheckInPayloadDto) {
    return this.attendancesService.checkIn(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.ATTENDANCE_CHECK_OUT)
  checkOut(@Payload() payload: CheckOutPayloadDto) {
    return this.attendancesService.checkOut(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.ATTENDANCE_LIST_ME)
  listMine(@Payload() query: MyAttendancesQueryDto) {
    return this.attendancesService.listMine(query);
  }

  @MessagePattern(MESSAGE_PATTERNS.ATTENDANCE_GET)
  findOne(@Payload() payload: AttendanceIdPayloadDto): Promise<AttendanceResponse> {
    return this.attendancesService.findOne(payload.id);
  }
}
