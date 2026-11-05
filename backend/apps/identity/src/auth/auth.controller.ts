import { LoginDto, MESSAGE_PATTERNS } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MESSAGE_PATTERNS.IDENTITY_LOGIN)
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
