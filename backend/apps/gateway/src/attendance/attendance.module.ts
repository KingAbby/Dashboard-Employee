import { DEFAULT_TIMEZONE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { createAttendanceUploadOptions } from './upload.config';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    EmployeesModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createAttendanceUploadOptions(
          config.get<string>('UPLOAD_DIR', './uploads'),
          Number(config.get<string>('MAX_UPLOAD_MB', '5')),
          config.get<string>('APP_TIMEZONE', DEFAULT_TIMEZONE),
        ),
    }),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
