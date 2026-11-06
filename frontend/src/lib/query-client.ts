import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Jangan tunda request saat browser melaporkan offline: biarkan gagal
      // dan tampilkan error, bukan state "kosong" yang menyesatkan.
      networkMode: 'always',
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
    },
  },
});
