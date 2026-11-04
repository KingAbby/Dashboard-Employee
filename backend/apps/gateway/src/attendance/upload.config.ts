import {
  DEFAULT_TIMEZONE,
  ERROR_MESSAGES,
  toZonedParts,
} from '@app/common';
import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { ALLOWED_PHOTO_MIME, ensureAttendancePhotoDirectory } from './photo-storage';

/**
 * Foto absensi: nama file selalu diganti UUID (nama dari klien diabaikan),
 * disimpan per bulan, dan hanya format gambar yang diterima.
 */
export const createAttendanceUploadOptions = (
  uploadDir: string,
  maxSizeMb: number,
  timeZone: string = DEFAULT_TIMEZONE,
): MulterOptions => ({
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      try {
        const today = toZonedParts(new Date(), timeZone).date;
        callback(null, ensureAttendancePhotoDirectory(uploadDir, today));
      } catch (error) {
        callback(error as Error, '');
      }
    },
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: maxSizeMb * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const expectedExtension = ALLOWED_PHOTO_MIME[file.mimetype];
    const actualExtension = extname(file.originalname).toLowerCase();

    if (!expectedExtension || actualExtension !== expectedExtension) {
      callback(new BadRequestException(ERROR_MESSAGES.ATTENDANCE_PHOTO_INVALID_TYPE), false);
      return;
    }

    callback(null, true);
  },
});
