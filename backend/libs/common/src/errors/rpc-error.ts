import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ERROR_MESSAGES } from '../constants/messages';

/** Bentuk error yang konsisten dari service ke gateway. */
export interface RpcErrorPayload {
  statusCode: number;
  error: string;
  message: string | string[];
}

const STATUS_TEXT: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

export const httpStatusText = (statusCode: number): string =>
  STATUS_TEXT[statusCode] ?? 'Error';

export class AppRpcException extends RpcException {
  constructor(statusCode: number, message: string | string[], error?: string) {
    super({ statusCode, error: error ?? httpStatusText(statusCode), message });
  }

  static badRequest(message: string | string[]): AppRpcException {
    return new AppRpcException(HttpStatus.BAD_REQUEST, message);
  }

  static unauthorized(message: string): AppRpcException {
    return new AppRpcException(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string): AppRpcException {
    return new AppRpcException(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message: string): AppRpcException {
    return new AppRpcException(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string): AppRpcException {
    return new AppRpcException(HttpStatus.CONFLICT, message);
  }

  static internal(message: string = ERROR_MESSAGES.INTERNAL): AppRpcException {
    return new AppRpcException(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Menyeragamkan berbagai jenis exception (HttpException dari ValidationPipe,
 * AppRpcException, error tak terduga) menjadi payload RPC.
 */
const normalizePayload = (raw: Record<string, unknown>): RpcErrorPayload | null => {
  if (typeof raw['statusCode'] === 'number') {
    return {
      statusCode: raw['statusCode'],
      error: typeof raw['error'] === 'string' ? raw['error'] : httpStatusText(raw['statusCode']),
      message: (raw['message'] as string | string[]) ?? ERROR_MESSAGES.INTERNAL,
    };
  }

  // RpcException yang sudah menyeberang TCP terlihat seperti
  // { error: { statusCode, message }, message }.
  const nested = raw['error'];
  if (isObject(nested) && typeof nested['statusCode'] === 'number') {
    return normalizePayload(nested);
  }

  return null;
};

export const toRpcErrorPayload = (exception: unknown): RpcErrorPayload => {
  // Error dari transport kehilangan prototype-nya, jadi bentuk payload
  // dikenali dari isinya, bukan dari instanceof.
  if (isObject(exception) && !(exception instanceof Error)) {
    const normalized = normalizePayload(exception);
    if (normalized) return normalized;
  }

  if (exception instanceof RpcException) {
    const raw = exception.getError();
    if (isObject(raw) && typeof raw['statusCode'] === 'number') {
      return {
        statusCode: raw['statusCode'] as number,
        error: typeof raw['error'] === 'string' ? raw['error'] : httpStatusText(400),
        message: (raw['message'] as string | string[]) ?? ERROR_MESSAGES.INTERNAL,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: httpStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
      message: typeof raw === 'string' ? raw : ERROR_MESSAGES.INTERNAL,
    };
  }

  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    let message: string | string[] = exception.message;

    if (typeof response === 'string') {
      message = response;
    } else if (isObject(response) && response['message'] !== undefined) {
      message = response['message'] as string | string[];
    }

    // Pesan bawaan class-validator berbahasa Inggris; ganti dengan pesan kita.
    if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
      message = message.length > 0 ? message : ERROR_MESSAGES.VALIDATION_FAILED;
    } else if (statusCode === HttpStatus.BAD_REQUEST && message === 'Bad Request Exception') {
      message = ERROR_MESSAGES.VALIDATION_FAILED;
    }

    return { statusCode, error: httpStatusText(statusCode), message };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: httpStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
    message: ERROR_MESSAGES.INTERNAL,
  };
};
