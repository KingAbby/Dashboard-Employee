import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: ['../.env', '.env'] });
import { RpcExceptionsFilter } from '@app/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IdentityModule } from './identity.module';

async function bootstrap(): Promise<void> {
  const port = Number(process.env.IDENTITY_TCP_PORT ?? 4001);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(IdentityModule, {
    transport: Transport.TCP,
    options: { host: process.env.IDENTITY_HOST ?? '127.0.0.1', port },
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
  Logger.log(`Identity service siap menerima pesan TCP di port ${port}`, 'Bootstrap');
}

void bootstrap();
