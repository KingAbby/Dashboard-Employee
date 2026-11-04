import { MESSAGE_PATTERNS, type JwtPayload, type LoginDto, type LoginResult } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IDENTITY_CLIENT } from '../clients/clients.module';

export interface LoginResponse extends LoginResult {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(IDENTITY_CLIENT) private readonly identity: ClientProxy,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const { user } = await firstValueFrom(
      this.identity.send<LoginResult>(MESSAGE_PATTERNS.IDENTITY_LOGIN, dto),
    );

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, user };
  }
}
