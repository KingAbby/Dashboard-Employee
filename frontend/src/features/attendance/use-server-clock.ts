import { useEffect, useState } from 'react';

/** Selaraskan jam tampilan dengan server; server tetap sumber kebenaran. */
export const useServerClock = (serverTime: string | undefined): Date => {
  const [offsetMs, setOffsetMs] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!serverTime) return;

    const timer = window.setTimeout(() => {
      setOffsetMs(new Date(serverTime).getTime() - Date.now());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [serverTime]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return new Date(now + offsetMs);
};
