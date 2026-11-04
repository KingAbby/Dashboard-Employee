import axios from 'axios';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../../lib/api';
import {
  SESSION_CHANGED_EVENT,
  SESSION_EXPIRED_EVENT,
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from '../../lib/session';
import type { AuthUser, LoginResponse } from '../../types/api';
import { AuthContext, type AuthContextValue } from './auth-context';
import { homePathFor } from './paths';

const toAuthUser = (user: LoginResponse['user']): AuthUser => ({
  id: user.id,
  employeeCode: user.employeeCode,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Sinkronkan state dengan localStorage: token bisa dibersihkan interceptor.
  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener(SESSION_CHANGED_EVENT, sync);
    window.addEventListener(SESSION_EXPIRED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, sync);
      window.removeEventListener(SESSION_EXPIRED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Validasi token sekali saat aplikasi dibuka, supaya token kedaluwarsa
  // atau akun yang dinonaktifkan langsung terlempar ke halaman login.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    api
      .get<AuthUser>('/auth/me')
      .then((response) => {
        if (cancelled) return;
        saveSession(token, response.data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const authUser = toAuthUser(response.data.user);
    saveSession(response.data.accessToken, authUser);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout, homePath: user ? homePathFor(user.role) : '/login' }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
