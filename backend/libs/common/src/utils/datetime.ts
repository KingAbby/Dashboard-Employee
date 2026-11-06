export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

export interface ZonedParts {
  date: string;
  minutes: number;
  hour: number;
  minute: number;
}

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

  const value = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const hour = value('hour');
  const minute = value('minute');

  return {
    date: `${value('year')}-${String(value('month')).padStart(2, '0')}-${String(value('day')).padStart(2, '0')}`,
    hour,
    minute,
    minutes: hour * 60 + minute,
  };
};

export const parseTimeToMinutes = (time: string): number => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

export const isLateCheckIn = (
  checkInMinutes: number,
  workStartMinutes: number,
  toleranceMinutes: number,
): boolean => checkInMinutes > workStartMinutes + toleranceMinutes;
