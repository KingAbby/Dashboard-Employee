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

/** Tanggal ISO (YYYY-MM-DD atau ISO datetime) → "04 Nov 2026". */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = value.length === 10 ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
};

export const formatLongDate = (value: Date = new Date()): string => longDateFormatter.format(value);

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
