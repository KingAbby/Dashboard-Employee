import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/messages';
import { AppRpcException, httpStatusText, toRpcErrorPayload } from './rpc-error';

describe('toRpcErrorPayload', () => {
  it('membaca payload yang dibungkus transport TCP', () => {
    // Bentuk yang benar-benar diterima gateway dari service lewat TCP.
    const fromTransport = {
      error: {
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      },
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    };

    expect(toRpcErrorPayload(fromTransport)).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  });

  it('mempertahankan status code dari AppRpcException', () => {
    const payload = toRpcErrorPayload(AppRpcException.conflict('Bentrok'));

    expect(payload.statusCode).toBe(409);
    expect(payload.message).toBe('Bentrok');
  });

  it('meneruskan pesan validasi dari HttpException', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['Email tidak valid.'],
      error: 'Bad Request',
    });

    const payload = toRpcErrorPayload(exception);

    expect(payload.statusCode).toBe(400);
    expect(payload.message).toEqual(['Email tidak valid.']);
  });

  it('memakai pesan Indonesia untuk exception Nest tanpa detail', () => {
    const payload = toRpcErrorPayload(new NotFoundException());

    expect(payload.statusCode).toBe(404);
    expect(payload.error).toBe('Not Found');
  });

  it('menutupi error tak dikenal sebagai 500 tanpa bocor detail', () => {
    const payload = toRpcErrorPayload(new Error('koneksi mysql gagal'));

    expect(payload.statusCode).toBe(500);
    expect(payload.message).toBe(ERROR_MESSAGES.INTERNAL);
  });

  it('mengenali payload polos hasil deserialisasi', () => {
    const payload = toRpcErrorPayload({ statusCode: 409, message: 'Sudah ada' });

    expect(payload.statusCode).toBe(409);
    expect(payload.error).toBe('Conflict');
  });
});

describe('httpStatusText', () => {
  it('mengembalikan teks status yang dikenal', () => {
    expect(httpStatusText(403)).toBe('Forbidden');
  });

  it('memberi fallback untuk status yang tidak dikenal', () => {
    expect(httpStatusText(418)).toBe('Error');
  });
});
