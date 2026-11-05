const TIMEZONE = 'Asia/Jakarta';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = value.length === 10 ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
};

export const formatTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return timeFormatter.format(date);
};

export const formatLongDate = (value: Date = new Date()): string => longDateFormatter.format(value);

/** Tanggal hari ini (YYYY-MM-DD) menurut zona aplikasi, bukan zona browser. */
export const todayISODate = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
