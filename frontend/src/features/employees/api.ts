import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type {
  Employee,
  EmployeePayload,
  EmployeeQuery,
  NextEmployeeCode,
  Paginated,
} from '../../types/api';

const EMPLOYEES_KEY = 'employees';

export const employeeKeys = {
  list: (query: EmployeeQuery) => [EMPLOYEES_KEY, 'list', query] as const,
  count: (isActive?: boolean) => [EMPLOYEES_KEY, 'count', isActive ?? 'all'] as const,
  nextCode: [EMPLOYEES_KEY, 'next-code'] as const,
};

export const fetchEmployees = async (query: EmployeeQuery): Promise<Paginated<Employee>> => {
  const { data } = await api.get<Paginated<Employee>>('/employees', {
    params: {
      page: query.page,
      limit: query.limit,
      ...(query.search ? { search: query.search } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
    },
  });
  return data;
};

export const useEmployeesQuery = (query: EmployeeQuery) =>
  useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => fetchEmployees(query),
    placeholderData: (previous) => previous,
  });

export const useEmployeeCount = (isActive?: boolean) =>
  useQuery({
    queryKey: employeeKeys.count(isActive),
    queryFn: async () => {
      const { data } = await api.get<Paginated<Employee>>('/employees', {
        params: { page: 1, limit: 1, ...(typeof isActive === 'boolean' ? { isActive } : {}) },
      });
      return data.meta.total;
    },
  });

export const useNextEmployeeCode = (enabled = true) =>
  useQuery({
    queryKey: employeeKeys.nextCode,
    queryFn: async () => {
      const { data } = await api.get<NextEmployeeCode>('/employees/next-code');
      return data;
    },
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeePayload) => {
      const { data } = await api.post<Employee>('/employees', payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: EmployeePayload }) => {
      const { data } = await api.patch<Employee>(`/employees/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
};

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<Employee>(`/employees/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
};
