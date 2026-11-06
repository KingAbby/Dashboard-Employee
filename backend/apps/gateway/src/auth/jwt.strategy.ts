import {
  ERROR_MESSAGES,
  MESSAGE_PATTERNS,
  type AuthUser,
  type EmployeeResponse,
  type JwtPayload,
} from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';
import { IDENTITY_CLIENT } from '../clients/clients.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @Inject(IDENTITY_CLIENT) private readonly identity: ClientProxy,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET belum diatur di .env');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /** Profil diambil ulang tiap request agar akun nonaktif langsung kehilangan akses. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    let employee: EmployeeResponse;

    try {
      employee = await firstValueFrom(
        this.identity.send<EmployeeResponse>(MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET, {
          id: payload.sub,
        }),
      );
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!employee.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role,
    };
  }
}
