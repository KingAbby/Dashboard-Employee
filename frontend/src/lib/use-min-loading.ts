import { useEffect, useRef, useState } from 'react';

/**
 * Menahan indikator loading sebentar supaya tidak cuma berkedip saat request
 * cepat. Timer tampil tidak dibatalkan ketika request selesai lebih dulu,
 * agar indikator tetap terlihat minimal `minVisibleMs`.
 */
export const useMinimumLoading = (active: boolean, delayMs = 0, minVisibleMs = 700): boolean => {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (!active) return;
    setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(true);
    }, delayMs);
  }, [active, delayMs]);

  useEffect(() => {
    if (active || !visible) return;
    const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAt.current));
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [active, visible, minVisibleMs]);

  return visible;
};
