# agent.md — Aplikasi Absensi WFH & Monitoring Karyawan

Dokumen ini adalah instruksi kerja untuk AI coding agent. Baca seluruhnya sebelum menulis kode, lalu kerjakan sesuai urutan di bagian "Rencana Kerja".

---

## 0. Aturan Utama

1. Ini **satu web app dengan dua role** (`EMPLOYEE` dan `ADMIN_HRD`), bukan dua aplikasi terpisah.
2. Ini **monorepo satu folder**: frontend dan backend berada di repo yang sama.
3. Baca `design.md` di root repo sebelum membuat UI. Pakai sebagai **patokan gaya**, bukan template yang disalin (lihat bagian 8).
4. Tooling harus **gratis** dan bisa dijalankan lokal tanpa akun berbayar.
5. Waktu pengerjaan target 3–4 hari, maksimal 5 hari. Jangan menambah fitur di luar scope. Kalau ada hal yang ambigu, pilih opsi paling sederhana, catat di `README.md` bagian "Keputusan", lalu lanjut.
6. Semua kode dalam TypeScript (`strict: true`). Nama identifier, endpoint, dan kolom database memakai bahasa Inggris. Teks yang tampil ke pengguna memakai bahasa Indonesia.

---

## 1. Ringkasan Requirement (dari PDF skill test)

**Stack wajib**
- Backend: JavaScript/TypeScript, **NestJS**.
- Database: MySQL, Oracle, MongoDB, SQL Server, atau PostgreSQL (diutamakan Oracle atau MySQL). Dipilih: **MySQL**.
- Frontend: **React.js**.

**Kemampuan yang dinilai**
- Backend: membuat struktur database yang benar, terhubung ke database, membuat API dengan **konsep microservices**, dan manipulasi data (create, read, update, delete) lewat API.
- Frontend: membuat halaman/screen, memanggil API ke/dari backend, dan membuat **custom component**.

**Use case 1 — Absensi WFH Karyawan**
Karyawan bisa login dan absen. Saat absen, sistem menangkap tanggal dan waktu, dan karyawan mengunggah foto sebagai bukti sedang bekerja di rumah.

**Use case 2 — Monitoring Karyawan**
Admin HRD menambah dan mengubah data master karyawan, serta memantau (view only) absensi yang sudah disubmit karyawan.

---

## 2. Keputusan Arsitektur

### Monorepo
```
/
├── agent.md
├── design.md
├── README.md
├── docker-compose.yml        # hanya MySQL
├── package.json              # script root (concurrently)
├── .env.example
├── backend/                  # NestJS monorepo mode
│   ├── apps/
│   │   ├── gateway/          # HTTP API, auth guard, upload, komposisi data
│   │   ├── identity/         # microservice: login + data master karyawan
│   │   └── attendance/       # microservice: absensi
│   ├── libs/
│   │   └── common/           # DTO bersama, enum, konstanta pesan, filter error
│   ├── uploads/              # foto absensi (di-gitignore)
│   └── nest-cli.json
└── frontend/                 # React + Vite + TypeScript
    └── src/
```

### Konsep microservices (yang dipakai)
- **gateway** (HTTP, port 3000): satu-satunya pintu dari frontend. Memvalidasi JWT, memeriksa role, menerima upload foto, lalu meneruskan perintah ke service lewat transport **TCP** NestJS (`@nestjs/microservices`, `ClientProxy`, `@MessagePattern`).
- **identity** (TCP, port 4001): mengurus login dan data master karyawan. Database sendiri: `hr_identity`.
- **attendance** (TCP, port 4002): mengurus data absensi. Database sendiri: `hr_attendance`.
- Satu instance MySQL, **dua database terpisah**. Tidak ada foreign key antar database. Attendance hanya menyimpan `employee_id` sebagai referensi biasa.
- Kalau gateway butuh nama karyawan untuk daftar absensi, gateway mengambil daftar absensi dari attendance service, lalu memanggil identity service dengan daftar `employee_id` dan menggabungkan hasilnya. Jangan duplikasi data karyawan di attendance service.
- Service TCP tidak diekspos ke luar. Hanya gateway yang menerima trafik dari frontend.
- Error dari service dikirim sebagai `RpcException`. Gateway punya exception filter yang memetakannya ke status HTTP yang tepat (400, 401, 403, 404, 409, 500).

> Batasan yang perlu dicatat di README: komunikasi TCP tanpa message broker. Cukup untuk skala tes ini; untuk produksi bisa diganti ke Redis/NATS/RabbitMQ.

### Library (semuanya gratis)
| Kebutuhan | Pilihan |
|---|---|
| ORM | TypeORM + migration (`synchronize: false`) |
| Validasi | `class-validator`, `class-transformer`, `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`) |
| Auth | `@nestjs/jwt`, `passport-jwt`, `bcrypt` |
| Upload | `multer` bawaan `@nestjs/platform-express` |
| Keamanan | `helmet`, CORS dibatasi ke origin frontend, `@nestjs/throttler` di endpoint login |
| Frontend | React 18, Vite, React Router, TanStack Query, Axios, React Hook Form + Zod |
| Styling | Tailwind CSS |
| Tanggal | `date-fns` + `date-fns-tz` (atau `dayjs` dengan plugin timezone) |
| Test | Jest (backend), Vitest + Testing Library (frontend, seperlunya) |
| Lint/format | ESLint + Prettier |

Jangan memakai library komponen UI siap pakai (MUI, Ant Design, shadcn). Requirement meminta kemampuan membuat custom component, jadi komponen dibuat sendiri dengan Tailwind (lihat bagian 7).

---

## 3. Struktur Database

### `hr_identity.employees`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) / UUID | PK |
| employee_code | VARCHAR(20) | unik, contoh `EMP-0001` |
| full_name | VARCHAR(120) | wajib |
| email | VARCHAR(150) | unik, dipakai untuk login |
| password_hash | VARCHAR(255) | bcrypt, cost 10–12 |
| role | ENUM('EMPLOYEE','ADMIN_HRD') | default `EMPLOYEE` |
| position | VARCHAR(100) | jabatan |
| department | VARCHAR(100) | divisi |
| phone | VARCHAR(30) | opsional |
| join_date | DATE | |
| is_active | TINYINT(1) | default 1; nonaktif = tidak bisa login |
| created_at, updated_at | DATETIME | |

Hapus data karyawan = **soft delete** (`is_active = 0`). Jangan hapus baris, karena riwayat absensi tetap harus bisa ditelusuri.

### `hr_attendance.attendances`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) / UUID | PK |
| employee_id | CHAR(36) | referensi ke employees (tanpa FK) |
| attendance_date | DATE | tanggal dalam zona Asia/Jakarta |
| check_in_at | DATETIME | disimpan UTC, diisi **server** |
| check_in_photo | VARCHAR(255) | nama file |
| check_out_at | DATETIME NULL | |
| check_out_photo | VARCHAR(255) NULL | |
| status | ENUM('ON_TIME','LATE') | dihitung server dari jam masuk |
| note | VARCHAR(255) NULL | opsional |
| created_at, updated_at | DATETIME | |

- Unique index `(employee_id, attendance_date)`: satu karyawan hanya punya satu record per hari.
- Index tambahan di `attendance_date` untuk filter admin.
- Buat lewat migration. Sediakan juga seed (bagian 9).

---

## 4. Aturan Bisnis Absensi

1. **Waktu selalu dari server**, bukan dari klien. Klien tidak mengirim timestamp.
2. Simpan waktu dalam UTC. Hitung `attendance_date` dan tampilkan ke pengguna dalam zona `Asia/Jakarta` (WIB).
3. Absen masuk wajib menyertakan foto. Tanpa foto, request ditolak (400).
4. Satu absen masuk per hari. Absen kedua di hari yang sama ditolak (409).
5. `status = LATE` jika jam masuk melebihi batas, dari env `WORK_START_TIME` (default `09:00`) ditambah `LATE_TOLERANCE_MINUTES` (default `0`).
6. Absen pulang: boleh dilakukan setelah absen masuk, juga dengan foto, maksimal sekali per hari. (Dikerjakan setelah fitur inti selesai. Kalau waktu mepet, boleh ditunda dan dicatat di README.)
7. Karyawan hanya bisa melihat dan membuat absensi **miliknya sendiri**. Admin HRD melihat semua, **hanya baca**: tidak ada endpoint edit atau hapus absensi untuk admin.
8. Karyawan nonaktif tidak bisa login dan tidak bisa absen.

### Aturan foto
- Format: `image/jpeg`, `image/png`, `image/webp`. Periksa MIME dan ekstensi.
- Ukuran maksimal 5 MB (bisa diatur lewat env).
- Nama file diganti dengan nama acak (UUID), jangan memakai nama dari klien.
- Disimpan di `backend/uploads/attendance/YYYY/MM/`. Folder ini masuk `.gitignore`.
- **Tidak** disajikan sebagai static file publik. Foto diambil lewat endpoint terautentikasi (bagian 5) yang memeriksa pemilik atau role admin.
- Di frontend, tawarkan dua cara: pilih file (input dengan `capture="user"` untuk kamera di ponsel) dan, jika waktu cukup, tombol ambil foto dari webcam (`getUserMedia`). Tampilkan preview sebelum dikirim.

---

## 5. Kontrak API (gateway)

Prefix `/api`. Semua endpoint selain login butuh header `Authorization: Bearer <token>`. Format error seragam:

```json
{ "statusCode": 409, "error": "Conflict", "message": "Anda sudah absen masuk hari ini." }
```

### Auth
| Method | Path | Role | Keterangan |
|---|---|---|---|
| POST | `/auth/login` | publik | body `{ email, password }` → `{ accessToken, user }` |
| GET | `/auth/me` | semua | profil dari token |

JWT berisi `sub` (employee id), `role`, masa berlaku dari env (default 8 jam). Endpoint login diberi rate limit.

### Karyawan (use case 2)
| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/employees` | ADMIN_HRD | list + pagination + `search` (nama/kode/email) + filter `isActive` |
| GET | `/employees/:id` | ADMIN_HRD | detail |
| POST | `/employees` | ADMIN_HRD | tambah karyawan (admin mengisi password awal) |
| PATCH | `/employees/:id` | ADMIN_HRD | ubah data; password opsional |
| DELETE | `/employees/:id` | ADMIN_HRD | nonaktifkan (soft delete). Admin tidak boleh menonaktifkan akunnya sendiri |

Respons tidak pernah memuat `password_hash`.

### Absensi (use case 1 dan 2)
| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/attendances/today` | EMPLOYEE | status absen hari ini milik sendiri |
| POST | `/attendances/check-in` | EMPLOYEE | `multipart/form-data`: field `photo` (+ `note` opsional) |
| POST | `/attendances/check-out` | EMPLOYEE | sama seperti check-in |
| GET | `/attendances/me` | EMPLOYEE | riwayat milik sendiri, pagination + filter rentang tanggal |
| GET | `/attendances` | ADMIN_HRD | semua absensi; filter `dateFrom`, `dateTo`, `employeeId`, `status`; pagination; sudah memuat nama karyawan |
| GET | `/attendances/:id/photo?type=in\|out` | pemilik atau ADMIN_HRD | mengirim file foto |

Pagination: `page` (mulai 1), `limit` (default 10, maksimal 100). Respons list: `{ data, meta: { page, limit, total, totalPages } }`.

### Pesan antar service (TCP)
Gunakan konstanta pattern di `libs/common`, misalnya `identity.login`, `identity.employee.create`, `attendance.checkIn`. Jangan menulis string pattern berulang di banyak file.

---

## 6. Halaman Frontend

Satu aplikasi, routing berdasarkan role. Setelah login, `EMPLOYEE` diarahkan ke `/absen`, `ADMIN_HRD` ke `/admin/absensi`.

| Path | Role | Isi |
|---|---|---|
| `/login` | publik | form email + password, pesan error jelas |
| `/absen` | EMPLOYEE | status hari ini, tombol absen masuk/pulang, komponen foto (pilih/ambil + preview), jam server, riwayat singkat |
| `/riwayat` | EMPLOYEE | riwayat absensi sendiri, filter tanggal, lihat foto |
| `/admin/karyawan` | ADMIN_HRD | tabel karyawan + pencarian + filter aktif/nonaktif + tombol tambah; edit lewat modal atau halaman form; konfirmasi sebelum nonaktifkan |
| `/admin/absensi` | ADMIN_HRD | tabel absensi (view only): filter tanggal, karyawan, status; kolom foto membuka modal pratinjau |
| `/admin/dashboard` *(opsional)* | ADMIN_HRD | ringkasan hari ini: hadir, terlambat, belum absen |

Kebutuhan lintas halaman:
- Route guard berdasarkan role. Akses ke halaman yang bukan haknya diarahkan ke halaman utama role-nya, bukan error kosong.
- Token disimpan di `localStorage` (cukup untuk scope tes ini; catat sebagai batasan). Axios interceptor menambah header dan mengarahkan ke `/login` saat menerima 401.
- Setiap halaman punya tiga keadaan: loading, kosong, dan error.
- Foto absensi diambil dengan header auth (mis. fetch sebagai blob lalu `URL.createObjectURL`), karena endpoint-nya tidak publik.
- Form divalidasi di klien (Zod) dan pesan error dari server ditampilkan di form.
- Responsif. Halaman `/absen` harus nyaman dipakai di layar ponsel, karena karyawan kemungkinan absen dari HP.

---

## 7. Custom Component

Buat sendiri di `frontend/src/components/ui/`, dengan props bertipe dan dipakai ulang di banyak halaman:

- `Button` (varian primary, secondary, danger, ghost; state loading)
- `Input`, `Select`, `Textarea` (dengan label, hint, pesan error)
- `Badge` / `StatusPill` (ON_TIME, LATE, aktif, nonaktif)
- `Card`, `StatCard`
- `Modal` (fokus terkunci, tutup dengan Esc)
- `DataTable` (kolom generik, loading, kosong, pagination)
- `PhotoCapture` (pilih file, opsional webcam, preview, validasi tipe dan ukuran)
- `ConfirmDialog`
- `Toast` sederhana
- Layout: `Sidebar`, `Topbar`, `AppLayout`

---

## 8. Panduan Desain (merujuk `design.md`)

Baca `design.md` di root. Pakai sebagai **patokan arah**, bukan untuk ditiru persis.

**Ambil dari `design.md`:**
- Karakter keseluruhan: bersih, profesional, hangat; latar putih/abu sangat muda dengan satu warna aksen oranye terakota.
- Token warna dan skala spacing, dipetakan ke `tailwind.config` (`primary`, `primary-tint`, `surface`, `border`, `text`, `text-muted`, plus warna semantik hijau/kuning/biru/merah untuk status).
- Pola umum: label kecil kapital dengan letter-spacing lebar untuk header tabel dan label grup menu, kartu putih bertepi tipis dan bayangan lembut, sidebar dengan item aktif berlatar tint dan penanda di sisi kiri, kartu statistik berwarna semantik, pill status.
- Radius, tipografi, dan kepadatan dashboard secara umum.

**Jangan salin:**
- Nama brand, logo, tagline, dan teks marketing dari `design.md`. Pakai nama dan logo placeholder sendiri (mis. wordmark teks sederhana) yang mudah diganti lewat satu konstanta.
- Layout landing page. Aplikasi ini tidak butuh landing page; mulai dari halaman login.
- Fitur atau menu yang tidak ada di requirement (payroll, cuti, lembur, multi-cabang, dan sebagainya).

**Yang boleh berbeda:** susunan halaman, komposisi kartu, ikon, dan detail visual lain boleh disesuaikan selama terasa satu keluarga dengan `design.md`. Kalau nilai di `design.md` bertabrakan dengan kebutuhan keterbacaan atau aksesibilitas (misalnya kontras teks abu terlalu rendah), utamakan keterbacaan dan catat penyesuaiannya.

Aksesibilitas minimum: kontras teks cukup, elemen interaktif bisa diakses keyboard, input punya label, status tidak hanya dibedakan lewat warna.

---

## 9. Seed dan Konfigurasi

### Akun seed (hanya untuk development)
| Role | Email | Password |
|---|---|---|
| ADMIN_HRD | `admin@example.com` | `Admin123!` |
| EMPLOYEE | `budi@example.com` | `Employee123!` |
| EMPLOYEE | `sari@example.com` | `Employee123!` |

Tambahkan beberapa data absensi contoh untuk 7 hari terakhir agar halaman admin tidak kosong saat demo. Tulis akun seed di README dan beri catatan bahwa itu hanya untuk lokal.

### `.env.example` (isi minimal)
```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=change_me
DB_IDENTITY_NAME=hr_identity
DB_ATTENDANCE_NAME=hr_attendance

# Service
GATEWAY_PORT=3000
IDENTITY_TCP_PORT=4001
ATTENDANCE_TCP_PORT=4002

# Auth
JWT_SECRET=change_me_long_random_string
JWT_EXPIRES_IN=8h

# Absensi
WORK_START_TIME=09:00
LATE_TOLERANCE_MINUTES=0
APP_TIMEZONE=Asia/Jakarta
MAX_UPLOAD_MB=5
UPLOAD_DIR=./uploads

# Frontend
VITE_API_URL=http://localhost:3000/api
FRONTEND_ORIGIN=http://localhost:5173
```
File `.env` tidak boleh ikut ter-commit.

### Script root
- `npm run db:up` → `docker compose up -d` (MySQL)
- `npm run migrate` → jalankan migration kedua database
- `npm run seed`
- `npm run dev` → jalankan gateway, identity, attendance, dan frontend bersamaan (`concurrently`)
- `npm run lint`, `npm run test`, `npm run build`

---

## 10. Rencana Kerja

Kerjakan berurutan. Centang tiap butir saat selesai, dan jalankan aplikasi di tiap akhir tahap agar tidak menumpuk masalah.

### Tahap 1 — Fondasi (hari 1)
- [ ] Inisialisasi repo, `.gitignore`, `.editorconfig`, ESLint, Prettier.
- [ ] `docker-compose.yml` untuk MySQL, `.env.example`.
- [ ] Backend NestJS mode monorepo: `gateway`, `identity`, `attendance`, `libs/common`.
- [ ] Koneksi TypeORM per service, migration awal kedua tabel, seed.
- [ ] Komunikasi TCP gateway ↔ service berjalan (satu pesan `ping` cukup untuk uji).
- [ ] Exception filter RPC → HTTP, `ValidationPipe` global, helmet, CORS.
- [ ] Frontend Vite + Tailwind, token dari `design.md`, routing dasar.

### Tahap 2 — Auth dan karyawan (hari 1–2)
- [ ] `identity.login`, JWT di gateway, `JwtAuthGuard` dan `RolesGuard`.
- [ ] CRUD karyawan di identity + endpoint gateway + validasi + soft delete.
- [ ] Halaman login, `AppLayout`, route guard role.
- [ ] Halaman `/admin/karyawan` lengkap (tabel, cari, tambah, ubah, nonaktifkan).

### Tahap 3 — Absensi (hari 2–3)
- [ ] Service attendance: check-in, status ON_TIME/LATE, aturan satu absen per hari.
- [ ] Upload foto di gateway (validasi, nama acak, folder per bulan) dan endpoint foto terautentikasi.
- [ ] Halaman `/absen` dengan `PhotoCapture`, status hari ini, riwayat singkat.
- [ ] Halaman `/riwayat`.
- [ ] Check-out (jika waktu cukup).

### Tahap 4 — Monitoring dan finishing (hari 3–4)
- [ ] Endpoint `GET /attendances` untuk admin dengan filter dan komposisi nama karyawan.
- [ ] Halaman `/admin/absensi` (view only) + modal foto.
- [ ] State loading/kosong/error di semua halaman, uji di layar ponsel.
- [ ] Unit test untuk aturan bisnis absensi dan satu e2e login.
- [ ] `README.md` lengkap (bagian 12).
- [ ] Tinjauan akhir sesuai checklist bagian 11.

### Cadangan (hari 5, hanya jika perlu)
- Dashboard ringkasan admin, ekspor CSV absensi, perbaikan visual.

---

## 11. Definisi Selesai (Checklist Akhir)

**Fungsional**
- [ ] Karyawan bisa login, absen masuk dengan foto, dan melihat riwayat sendiri.
- [ ] Waktu absen berasal dari server; absen ganda di hari yang sama ditolak.
- [ ] Admin HRD bisa menambah, melihat, mengubah, dan menonaktifkan karyawan.
- [ ] Admin HRD bisa melihat semua absensi beserta foto, tanpa kemampuan mengubah atau menghapusnya.
- [ ] Karyawan tidak bisa membuka halaman atau endpoint admin, dan sebaliknya endpoint absen karyawan ditolak untuk admin.

**Teknis**
- [ ] Tiga proses backend (gateway, identity, attendance) berjalan terpisah dan berkomunikasi lewat TCP.
- [ ] Dua database terpisah, tanpa foreign key lintas database.
- [ ] Semua input divalidasi dengan DTO; tidak ada `password_hash` yang bocor di respons.
- [ ] Tidak ada secret di repo; `.env.example` lengkap.
- [ ] `npm run lint`, `npm run test`, dan `npm run build` lulus tanpa error.
- [ ] Setelah `git clone`, orang lain bisa menjalankan aplikasi hanya dengan mengikuti README.

**Tampilan**
- [ ] UI konsisten dengan arah di `design.md` tanpa menyalin brand dan teksnya.
- [ ] Custom component di bagian 7 sudah ada dan dipakai ulang.
- [ ] Halaman `/absen` nyaman di layar ponsel.

---

## 12. Isi README.md yang Wajib Ada

1. Deskripsi singkat aplikasi dan dua role.
2. Diagram arsitektur (Mermaid): frontend → gateway → identity/attendance → database.
3. Diagram ER kedua database (Mermaid).
4. Prasyarat (Node versi yang dipakai, Docker) dan langkah menjalankan dari nol.
5. Akun seed.
6. Daftar endpoint (ringkas, boleh merujuk ke bagian 5 dokumen ini).
7. Bagian "Keputusan dan Batasan": mengapa TCP tanpa broker, token di `localStorage`, soft delete, absen pulang (selesai atau ditunda), dan hal lain yang diputuskan sendiri.
8. Cara menjalankan test.

Tulis README dengan bahasa yang biasa dan jelas, seperti catatan developer ke developer lain. Hindari kalimat promosi dan klaim berlebihan.

---

## 13. Konvensi Kerja

- **Commit**: kecil dan sering, format `type(scope): pesan` (contoh `feat(attendance): tolak check-in ganda`). Satu commit satu perubahan yang utuh.
- **Struktur backend**: satu module per fitur; controller tipis, logika di service; DTO dan entity dipisah.
- **Penamaan**: file `kebab-case`, class `PascalCase`, variabel `camelCase`, kolom database `snake_case`.
- **Error**: pesan untuk pengguna dalam bahasa Indonesia, jelas, dan tanpa membocorkan detail internal (stack trace, query SQL).
- **Komentar**: hanya untuk menjelaskan *alasan*, bukan mengulang isi kode.
- **Dependensi**: tambahkan hanya jika perlu. Jangan menambah library hanya karena populer.

## 14. Jangan Dilakukan

- Jangan membuat dua aplikasi atau dua frontend terpisah untuk dua role.
- Jangan menaruh timestamp absensi dari klien.
- Jangan menyajikan folder `uploads` sebagai static publik.
- Jangan memberi admin endpoint untuk mengubah atau menghapus absensi.
- Jangan menambah modul di luar requirement (payroll, cuti, lembur, notifikasi, dan sebagainya).
- Jangan memakai layanan berbayar atau yang membutuhkan kartu kredit.
- Jangan menyalin brand, logo, atau teks dari `design.md`.
- Jangan meng-commit `.env`, foto absensi, atau `node_modules`.
