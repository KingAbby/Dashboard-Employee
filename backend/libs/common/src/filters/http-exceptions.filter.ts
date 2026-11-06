import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { Response } from 'express';
import { toRpcErrorPayload, type RpcErrorPayload } from '../errors/rpc-error';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const payload: RpcErrorPayload = toRpcErrorPayload(exception);

    if (payload.statusCode >= 500 && !(exception instanceof RpcException)) {
      this.logger.error(
        exception instanceof Error ? exception.message : payload.message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(payload.statusCode).json(payload);
  }
}
