import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { photoContentMatches } from './photo-storage';

/**
 * MIME dari klien tidak dipercaya; isi file dicek lewat tanda tangan.
 * Test ini menjaga agar file non-gambar tidak bisa lolos sebagai foto absensi.
 */
describe('photoContentMatches', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  const webp = Buffer.concat([
    Buffer.from('RIFF', 'latin1'),
    Buffer.from([0x24, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP', 'latin1'),
    Buffer.from([0x56, 0x50, 0x38, 0x20]),
  ]);

  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'dexahr-photo-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const write = async (name: string, content: Buffer): Promise<string> => {
    const path = join(directory, name);
    await writeFile(path, content);
    return path;
  };

  it('menerima PNG yang benar', async () => {
    const path = await write('a.png', png);
    await expect(photoContentMatches(path, 'image/png')).resolves.toBe(true);
  });

  it('menerima JPEG yang benar', async () => {
    const path = await write('a.jpg', jpeg);
    await expect(photoContentMatches(path, 'image/jpeg')).resolves.toBe(true);
  });

  it('menerima WEBP yang benar', async () => {
    const path = await write('a.webp', webp);
    await expect(photoContentMatches(path, 'image/webp')).resolves.toBe(true);
  });

  it('menolak isi PNG yang diklaim JPEG', async () => {
    const path = await write('palsu.jpg', png);
    await expect(photoContentMatches(path, 'image/jpeg')).resolves.toBe(false);
  });

  it('menolak file teks biasa', async () => {
    const path = await write('catatan.png', Buffer.from('bukan gambar', 'utf8'));
    await expect(photoContentMatches(path, 'image/png')).resolves.toBe(false);
  });

  it('menolak MIME yang tidak didukung', async () => {
    const path = await write('a.gif', Buffer.from('GIF89a', 'latin1'));
    await expect(photoContentMatches(path, 'image/gif')).resolves.toBe(false);
  });
});
