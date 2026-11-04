import 'reflect-metadata';
import { HttpExceptionsFilter } from '@app/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173').split(','),
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionsFilter());
  app.enableShutdownHooks();

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Gateway siap di http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
