import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type {
  AdminAttendance,
  Attendance,
  AttendanceAdminQuery,
  AttendancePhotoType,
  AttendanceQuery,
  AttendanceSummary,
  Paginated,
  TodayAttendance,
} from '../../types/api';

const ATTENDANCE_KEY = 'attendance';

export const attendanceKeys = {
  today: [ATTENDANCE_KEY, 'today'] as const,
  mine: (query: AttendanceQuery) => [ATTENDANCE_KEY, 'mine', query] as const,
  admin: (query: AttendanceAdminQuery) => [ATTENDANCE_KEY, 'admin', query] as const,
  summary: [ATTENDANCE_KEY, 'summary'] as const,
};

const toParams = (query: AttendanceAdminQuery) => ({
  page: query.page,
  limit: query.limit,
  ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
  ...(query.dateTo ? { dateTo: query.dateTo } : {}),
  ...(query.employeeId ? { employeeId: query.employeeId } : {}),
  ...(query.search ? { search: query.search } : {}),
  ...(query.status ? { status: query.status } : {}),
});

export const useTodayAttendance = () =>
  useQuery({
    queryKey: attendanceKeys.today,
    queryFn: async () => {
      const { data } = await api.get<TodayAttendance>('/attendances/today');
      return data;
    },
    refetchInterval: 30_000,
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

export const useAdminAttendances = (
  query: AttendanceAdminQuery,
  options: { refetchInterval?: number } = {},
) =>
  useQuery({
    queryKey: attendanceKeys.admin(query),
    queryFn: async () => {
      const { data } = await api.get<Paginated<AdminAttendance>>('/attendances', {
        params: toParams(query),
      });
      return data;
    },
    placeholderData: (previous) => previous,
    refetchInterval: options.refetchInterval,
  });

export const useAttendanceSummary = () =>
  useQuery({
    queryKey: attendanceKeys.summary,
    queryFn: async () => {
      const { data } = await api.get<AttendanceSummary>('/attendances/summary');
      return data;
    },
    refetchInterval: 30_000,
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
