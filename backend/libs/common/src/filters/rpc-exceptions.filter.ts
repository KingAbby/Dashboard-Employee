import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { toRpcErrorPayload } from '../errors/rpc-error';

/**
 * Filter global untuk service TCP.
 *
 * Nest mengubah HttpException dari ValidationPipe menjadi pesan generik saat
 * keluar lewat transport TCP, sehingga status code aslinya hilang. Filter ini
 * mengemas ulang error tersebut menjadi payload RpcException yang bisa dibaca
 * gateway untuk menentukan status HTTP.
 */
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
