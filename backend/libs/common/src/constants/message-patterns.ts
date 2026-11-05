/** Pattern TCP dipakai gateway & service agar string tidak tersebar. */
export const MESSAGE_PATTERNS = {
  PING: 'ping',

  IDENTITY_LOGIN: 'identity.login',
  IDENTITY_EMPLOYEE_LIST: 'identity.employee.list',
  IDENTITY_EMPLOYEE_GET: 'identity.employee.get',
  IDENTITY_EMPLOYEE_GET_MANY: 'identity.employee.getMany',
  IDENTITY_EMPLOYEE_NEXT_CODE: 'identity.employee.nextCode',
  IDENTITY_EMPLOYEE_CREATE: 'identity.employee.create',
  IDENTITY_EMPLOYEE_UPDATE: 'identity.employee.update',
  IDENTITY_EMPLOYEE_DEACTIVATE: 'identity.employee.deactivate',

  ATTENDANCE_TODAY: 'attendance.today',
  ATTENDANCE_CHECK_IN: 'attendance.checkIn',
  ATTENDANCE_CHECK_OUT: 'attendance.checkOut',
  ATTENDANCE_LIST_ME: 'attendance.listMe',
  ATTENDANCE_LIST: 'attendance.list',
  ATTENDANCE_SUMMARY: 'attendance.summary',
  ATTENDANCE_GET: 'attendance.get',
} as const;

export type MessagePattern = (typeof MESSAGE_PATTERNS)[keyof typeof MESSAGE_PATTERNS];

export const SERVICE_NAMES = {
  GATEWAY: 'gateway',
  IDENTITY: 'identity',
  ATTENDANCE: 'attendance',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
