import {
  ERROR_MESSAGES,
  IdParamDto,
  ListMyAttendancesQueryDto,
  Role,
  type AttendancePhotoQueryDto,
  type AuthUser,
} from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceBodyDto } from './dto/attendance-body.dto';
import { attendancePhotoPath, mimeForPhoto } from './photo-storage';

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly config: ConfigService,
  ) {}

  @Get('today')
  @Roles(Role.EMPLOYEE)
  today(@CurrentUser() user: AuthUser) {
    return this.attendanceService.today(user.id);
  }

  @Post('check-in')
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo'))
  async checkIn(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: AttendanceBodyDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException(ERROR_MESSAGES.ATTENDANCE_PHOTO_REQUIRED);

    try {
      return await this.attendanceService.checkIn(user.id, file.filename, body.note);
    } catch (error) {
      // Absen ditolak (mis. sudah absen hari ini) — jangan tinggalkan file yatim.
      await rm(file.path, { force: true });
      throw error;
    }
  }

  @Post('check-out')
  @Roles(Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photo'))
  async checkOut(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: AttendanceBodyDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException(ERROR_MESSAGES.ATTENDANCE_PHOTO_REQUIRED);

    try {
      return await this.attendanceService.checkOut(user.id, file.filename, body.note);
    } catch (error) {
      await rm(file.path, { force: true });
      throw error;
    }
  }

  @Get('me')
  @Roles(Role.EMPLOYEE)
  listMine(@Query() query: ListMyAttendancesQueryDto, @CurrentUser() user: AuthUser) {
    return this.attendanceService.listMine(user.id, query);
  }

  /** Foto tidak pernah publik: pemilik atau admin HRD, lewat header Authorization. */
  @Get(':id/photo')
  async photo(
    @Param() params: IdParamDto,
    @Query() query: AttendancePhotoQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const attendance = await this.attendanceService.detail(params.id);

    const isOwner = attendance.employeeId === user.id;
    if (!isOwner && user.role !== Role.ADMIN_HRD) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    const filename = query.type === 'out' ? attendance.checkOutPhoto : attendance.checkInPhoto;
    if (!filename) {
      throw new NotFoundException(ERROR_MESSAGES.ATTENDANCE_PHOTO_MISSING);
    }

    const filePath = attendancePhotoPath(
      this.config.get<string>('UPLOAD_DIR', './uploads'),
      attendance.attendanceDate,
      filename,
    );

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException(ERROR_MESSAGES.ATTENDANCE_PHOTO_MISSING);
    }

    return new StreamableFile(createReadStream(filePath), {
      type: mimeForPhoto(filePath),
      disposition: 'inline',
    });
  }
}
