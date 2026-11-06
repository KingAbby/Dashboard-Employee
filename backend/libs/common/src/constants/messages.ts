/** Pesan yang tampil ke pengguna. Bahasa Indonesia, tanpa detail internal. */
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Data yang dikirim tidak valid.',
  INTERNAL: 'Terjadi kesalahan pada server. Coba lagi beberapa saat lagi.',

  INVALID_CREDENTIALS: 'Email atau password salah.',
  ACCOUNT_INACTIVE: 'Akun Anda tidak aktif. Hubungi admin HRD.',
  UNAUTHORIZED: 'Sesi Anda sudah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak punya akses ke halaman ini.',

  EMPLOYEE_NOT_FOUND: 'Karyawan tidak ditemukan.',
  EMPLOYEE_EMAIL_TAKEN: 'Email sudah dipakai karyawan lain.',
  EMPLOYEE_CODE_TAKEN: 'Kode karyawan sudah dipakai.',
  EMPLOYEE_CANNOT_DEACTIVATE_SELF: 'Anda tidak bisa menonaktifkan akun sendiri.',
  EMPLOYEE_CANNOT_CHANGE_OWN_ROLE: 'Role akun sendiri tidak bisa diubah.',

  ATTENDANCE_NOT_FOUND: 'Data absensi tidak ditemukan.',
  ATTENDANCE_ALREADY_CHECKED_IN: 'Anda sudah absen masuk hari ini.',
  ATTENDANCE_NOT_CHECKED_IN: 'Anda belum absen masuk hari ini.',
  ATTENDANCE_ALREADY_CHECKED_OUT: 'Anda sudah absen pulang hari ini.',
  ATTENDANCE_PHOTO_REQUIRED: 'Foto bukti wajib dilampirkan.',
  ATTENDANCE_PHOTO_INVALID_TYPE: 'Format foto harus JPG, PNG, atau WEBP.',
  ATTENDANCE_PHOTO_TOO_LARGE: 'Ukuran foto melebihi batas maksimal.',
  ATTENDANCE_PHOTO_MISSING: 'File foto tidak ditemukan.',
} as const;
