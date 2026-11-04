import { MESSAGE_PATTERNS, SERVICE_NAMES, type PingResponse } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @MessagePattern(MESSAGE_PATTERNS.PING)
  ping(): PingResponse {
    return { service: SERVICE_NAMES.ATTENDANCE, pong: true, timestamp: new Date().toISOString() };
  }
}
