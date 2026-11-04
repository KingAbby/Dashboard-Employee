import axios from 'axios';
import type { ApiErrorBody } from '../types/api';
import { getToken, notifySessionExpired } from './session';

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      // Login yang gagal juga 401, jadi jangan sampai memicu "sesi berakhir".
      if (status === 401 && !url.includes('/auth/login')) notifySessionExpired();
    }
    return Promise.reject(error);
  },
);

const readBody = (error: unknown): ApiErrorBody | null => {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as ApiErrorBody | undefined;
  return body && typeof body === 'object' && 'message' in body ? body : null;
};

/** Semua pesan error dari server, siap ditampilkan di form atau toast. */
export const toErrorList = (error: unknown): string[] => {
  const body = readBody(error);

  if (body) {
    return Array.isArray(body.message) ? body.message : [body.message];
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return ['Tidak bisa menghubungi server. Pastikan backend sedang berjalan.'];
    }
    if (error.response?.status === 429) {
      return ['Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'];
    }
  }

  return ['Terjadi kesalahan. Coba lagi beberapa saat lagi.'];
};

export const toErrorMessage = (error: unknown): string => toErrorList(error).join(' ');
