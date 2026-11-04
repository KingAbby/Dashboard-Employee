import { ERROR_MESSAGES, type AuthUser } from '@app/common';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = AuthUser>(
    err: unknown,
    user: TUser | false,
    _info?: unknown,
    _context?: ExecutionContext,
  ): TUser {
    if (err) throw err;
    if (!user) throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    return user;
  }
}
