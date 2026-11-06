import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const IDENTITY_CLIENT = 'IDENTITY_CLIENT';
export const ATTENDANCE_CLIENT = 'ATTENDANCE_CLIENT';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: IDENTITY_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('IDENTITY_HOST', '127.0.0.1'),
            port: Number(config.get<string>('IDENTITY_TCP_PORT', '4001')),
          },
        }),
      },
      {
        name: ATTENDANCE_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('ATTENDANCE_HOST', '127.0.0.1'),
            port: Number(config.get<string>('ATTENDANCE_TCP_PORT', '4002')),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ClientsModuleConfig {}
