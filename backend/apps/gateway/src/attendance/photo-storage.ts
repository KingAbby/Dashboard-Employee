import { mkdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

/** MIME yang diterima, dipetakan ke ekstensi yang diizinkan. */
export const ALLOWED_PHOTO_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export const mimeForPhoto = (filePath: string): string =>
  MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

/** uploads/attendance/YYYY/MM — bulan mengikuti zona aplikasi. */
export const attendancePhotoDirectory = (uploadDir: string, isoDate: string): string => {
  const [year, month] = isoDate.split('-');
  return join(resolve(uploadDir), 'attendance', year, month);
};

export const ensureAttendancePhotoDirectory = (uploadDir: string, isoDate: string): string => {
  const directory = attendancePhotoDirectory(uploadDir, isoDate);
  mkdirSync(directory, { recursive: true });
  return directory;
};

/**
 * Path file dari database. `filename` diambil dari nama yang kita buat sendiri
 * (UUID + ekstensi), tetapi tetap divalidasi agar tidak bisa keluar folder.
 */
export const attendancePhotoPath = (
  uploadDir: string,
  attendanceDate: string,
  filename: string,
): string => {
  const safeName = basename(filename);
  return join(attendancePhotoDirectory(uploadDir, attendanceDate), safeName);
};
