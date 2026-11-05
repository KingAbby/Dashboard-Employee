import { mkdirSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

/** MIME yang diterima, dipetakan ke ekstensi yang diizinkan. */
export const ALLOWED_PHOTO_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** Tanda tangan isi file, supaya MIME dari klien tidak bisa dipalsukan. */
const SIGNATURES: Record<string, (head: Buffer) => boolean> = {
  'image/jpeg': (head) => head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff,
  'image/png': (head) =>
    head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (head) =>
    head.subarray(0, 4).toString('latin1') === 'RIFF' &&
    head.subarray(8, 12).toString('latin1') === 'WEBP',
};

export const photoContentMatches = async (filePath: string, mimetype: string): Promise<boolean> => {
  const matches = SIGNATURES[mimetype];
  if (!matches) return false;

  const handle = await open(filePath, 'r');
  try {
    const head = Buffer.alloc(12);
    const { bytesRead } = await handle.read(head, 0, head.length, 0);
    return matches(head.subarray(0, bytesRead));
  } finally {
    await handle.close();
  }
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

/** basename() mencegah nama file keluar dari folder uploads. */
export const attendancePhotoPath = (
  uploadDir: string,
  attendanceDate: string,
  filename: string,
): string => {
  const safeName = basename(filename);
  return join(attendancePhotoDirectory(uploadDir, attendanceDate), safeName);
};
