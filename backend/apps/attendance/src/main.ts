import 'reflect-metadata';
import { RpcExceptionsFilter } from '@app/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AttendanceModule } from './attendance.module';

async function bootstrap(): Promise<void> {
  const port = Number(process.env.ATTENDANCE_TCP_PORT ?? 4002);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AttendanceModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionsFilter());

  await app.listen();
  Logger.log(`Attendance service siap menerima pesan TCP di port ${port}`, 'Bootstrap');
}

void bootstrap();
