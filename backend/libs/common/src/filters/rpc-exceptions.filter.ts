import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { toRpcErrorPayload } from '../errors/rpc-error';

@Catch()
export class RpcExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionsFilter.name);

  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    const payload = toRpcErrorPayload(exception);
    if (payload.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.message : payload.message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    return throwError(() => new RpcException(payload));
  }
}
