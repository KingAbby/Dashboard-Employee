import { ERROR_MESSAGES, MESSAGE_PATTERNS, SERVICE_NAMES, type PingResponse } from '@app/common';
import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of, timeout, catchError, type Observable } from 'rxjs';
import { ATTENDANCE_CLIENT, IDENTITY_CLIENT } from '../clients/clients.module';

interface ServiceHealth {
  service: string;
  reachable: boolean;
  timestamp?: string;
  error?: string;
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @Inject(IDENTITY_CLIENT) private readonly identity: ClientProxy,
    @Inject(ATTENDANCE_CLIENT) private readonly attendance: ClientProxy,
  ) {}

  /** Membuktikan jalur gateway -> identity/attendance (TCP) hidup. */
  @Get()
  async check() {
    const [identity, attendance] = await Promise.all([
      this.ping(this.identity, SERVICE_NAMES.IDENTITY),
      this.ping(this.attendance, SERVICE_NAMES.ATTENDANCE),
    ]);

    return {
      status: identity.reachable && attendance.reachable ? 'ok' : 'degraded',
      services: { identity, attendance },
      timestamp: new Date().toISOString(),
    };
  }

  private async ping(client: ClientProxy, service: string): Promise<ServiceHealth> {
    const fallback = (error?: string): Observable<ServiceHealth> =>
      of({ service, reachable: false, error: error ?? ERROR_MESSAGES.INTERNAL });

    const response = await firstValueFrom(
      client.send<PingResponse>(MESSAGE_PATTERNS.PING, {}).pipe(
        timeout(3000),
        catchError(() => {
          this.logger.warn(`Service ${service} tidak merespons ping.`);
          return fallback(`Service ${service} tidak merespons.`);
        }),
      ),
    );

    return { service, reachable: true, timestamp: response.timestamp };
  }
}
