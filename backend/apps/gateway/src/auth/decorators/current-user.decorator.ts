import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@app/common';

/** Mengambil user hasil JwtStrategy dari request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
