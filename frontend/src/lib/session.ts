import type { AuthUser } from '../types/api';

const TOKEN_KEY = 'dexahr.token';
const USER_KEY = 'dexahr.user';
export const SESSION_CHANGED_EVENT = 'dexahr:session-changed';
export const SESSION_EXPIRED_EVENT = 'dexahr:session-expired';

/**
 * Token di localStorage: cukup untuk scope tes ini. Catat sebagai batasan
 * (rawan XSS, tidak ada refresh token) di README.
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const notifySessionExpired = (): void => {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
