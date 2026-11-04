-- Dijalankan MySQL hanya saat volume masih kosong.
-- Skrip migrate juga membuat database ini, jadi tetap aman untuk volume lama.
CREATE DATABASE IF NOT EXISTS hr_identity
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS hr_attendance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
