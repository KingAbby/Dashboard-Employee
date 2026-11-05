/** Identitas aplikasi; logo berasal dari public/DexaHR.png yang dipangkas. */
export const BRAND = {
  name: 'DexaHR',
  tagline: 'Portal Kehadiran',
  logo: '/dexahr-logo.png',
  mark: '/dexahr-mark.png',
} as const;

export const ROLE_LABEL: Record<'EMPLOYEE' | 'ADMIN_HRD', string> = {
  EMPLOYEE: 'Karyawan',
  ADMIN_HRD: 'Admin HRD',
};

export const NAV_GROUPS = [
  {
    label: 'Operasional',
    items: [
      { to: '/absen', label: 'Absen Hari Ini', icon: 'clock', roles: ['EMPLOYEE'] },
      { to: '/riwayat', label: 'Riwayat Saya', icon: 'history', roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { to: '/admin/dashboard', label: 'Ringkasan', icon: 'grid', roles: ['ADMIN_HRD'] },
      { to: '/admin/karyawan', label: 'Data Karyawan', icon: 'users', roles: ['ADMIN_HRD'] },
      { to: '/admin/absensi', label: 'Monitoring Absensi', icon: 'calendar', roles: ['ADMIN_HRD'] },
    ],
  },
] as const;
