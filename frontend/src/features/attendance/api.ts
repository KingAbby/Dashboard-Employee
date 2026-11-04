import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type {
  Attendance,
  AttendancePhotoType,
  AttendanceQuery,
  Paginated,
  TodayAttendance,
} from '../../types/api';

const ATTENDANCE_KEY = 'attendance';

export const attendanceKeys = {
  today: [ATTENDANCE_KEY, 'today'] as const,
  mine: (query: AttendanceQuery) => [ATTENDANCE_KEY, 'mine', query] as const,
};

export const useTodayAttendance = () =>
  useQuery({
    queryKey: attendanceKeys.today,
    queryFn: async () => {
      const { data } = await api.get<TodayAttendance>('/attendances/today');
      return data;
    },
    refetchInterval: 60_000,
  });

export const useMyAttendances = (query: AttendanceQuery) =>
  useQuery({
    queryKey: attendanceKeys.mine(query),
    queryFn: async () => {
      const { data } = await api.get<Paginated<Attendance>>('/attendances/me', { params: query });
      return data;
    },
    placeholderData: (previous) => previous,
  });

const useAttendanceMutation = (path: 'check-in' | 'check-out') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await api.post<Attendance>(`/attendances/${path}`, form);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] }),
  });
};

export const useCheckIn = () => useAttendanceMutation('check-in');
export const useCheckOut = () => useAttendanceMutation('check-out');

/** Ambil foto sebagai blob (endpoint tidak publik) lalu jadikan object URL. */
export const fetchAttendancePhoto = async (
  attendanceId: string,
  type: AttendancePhotoType,
): Promise<string> => {
  const { data } = await api.get<Blob>(`/attendances/${attendanceId}/photo`, {
    params: { type },
    responseType: 'blob',
  });
  return URL.createObjectURL(data);
};
