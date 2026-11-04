/**
 * Semua perhitungan waktu absensi memakai zona aplikasi (Asia/Jakarta),
 * bukan zona server atau browser. Fungsi di sini murni (tanpa dependency).
 */

export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

export interface ZonedParts {
  date: string;
  minutes: number;
  hour: number;
  minute: number;
}

/** Tanggal + jam "dinding" pada zona tertentu, mis. { date: "2026-11-04", minutes: 545 }. */
export const toZonedParts = (instant: Date, timeZone: string): ZonedParts => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(instant)
    .filter((part) => part.type !== 'literal');

  const value = (type: string): number => Number(parts.find((part) => part.type === type)?.value ?? 0);

  const hour = value('hour');
  const minute = value('minute');

  return {
    date: `${value('year')}-${String(value('month')).padStart(2, '0')}-${String(value('day')).padStart(2, '0')}`,
    hour,
    minute,
    minutes: hour * 60 + minute,
  };
};

/** "09:00" atau "09:00:00" → 540. */
export const parseTimeToMinutes = (time: string): number => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

/**
 * Terlambat bila jam masuk melewati WORK_START_TIME + toleransi.
 * Semua argumen sudah dalam menit sejak tengah malam zona aplikasi.
 */
export const isLateCheckIn = (
  checkInMinutes: number,
  workStartMinutes: number,
  toleranceMinutes: number,
): boolean => checkInMinutes > workStartMinutes + toleranceMinutes;
