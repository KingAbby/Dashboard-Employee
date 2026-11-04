# DESIGN.md — klikHadir Enterprise

Sistem desain untuk landing page dan portal admin klikHadir, platform HRIS (presensi, manajemen karyawan, payroll). Dokumen ini disusun dari screenshot, jadi semua nilai warna, ukuran, dan radius adalah **estimasi visual**. Cocokkan dengan DevTools atau file desain asli sebelum dipakai sebagai acuan final.

---

## 1. Karakter Visual

- **Kesan**: bersih, profesional, hangat. Dasar putih dan abu sangat muda, satu warna aksen oranye terakota yang dipakai hemat.
- **Bahasa**: Indonesia, nada formal tapi langsung ("Kalau ini masih terasa familiar...").
- **Kepadatan**: landing page lega dengan banyak ruang kosong. Dashboard lebih padat dan informatif, tapi tetap rapi karena kartu dipisah dengan jarak yang konsisten.
- **Pola khas**:
  - Label kecil huruf kapital dengan letter-spacing lebar (eyebrow, label section, header tabel).
  - Satu kata kunci di headline diwarnai oranye.
  - Kartu putih dengan border tipis dan bayangan lembut.
  - Warna semantik (hijau, kuning, biru, merah) hanya untuk status dan angka, bukan dekorasi.

---

## 2. Warna

### Brand
| Token | Estimasi | Pemakaian |
|---|---|---|
| `--primary` | `#D9824A` | Tombol utama, kata kunci headline, ikon logo, panel "Dengan klikHadir" |
| `--primary-strong` | `#E07B39` | Teks aksen di headline, item menu aktif |
| `--primary-tint` | `#FDF1E8` | Latar item sidebar aktif, glow hero, badge ringan |

### Netral
| Token | Estimasi | Pemakaian |
|---|---|---|
| `--bg` | `#FAFAF8` | Latar halaman |
| `--surface` | `#FFFFFF` | Kartu, navbar, sidebar |
| `--surface-muted` | `#EEF2F6` | Panel "Cara Lama" (biru-abu muda) |
| `--border` | `#E6E8EC` | Border kartu, input, divider |
| `--text` | `#1A1A1A` | Headline, judul kartu |
| `--text-muted` | `#6B7280` | Paragraf, deskripsi, nilai sekunder |
| `--text-subtle` | `#9CA3AF` | Label section sidebar, placeholder, teks pendukung |

### Semantik (status dashboard)
| Status | Teks / ikon | Latar kartu |
|---|---|---|
| Tepat Waktu | `#16A36A` hijau | `#ECFAF3` |
| Terlambat | `#E0A100` kuning-amber | `#FFF8E5` |
| Cuti / Sakit / SKD | `#2F80D0` biru | `#EAF3FC` |
| Alpa / Mangkir | `#E5484D` merah | `#FDECEE` |
| Tingkat Kehadiran | `--primary` | putih / `--primary-tint` |

Aturan: warna semantik hanya muncul bersama angka atau label status. Jangan dipakai sebagai latar besar.

---

## 3. Tipografi

- **Font**: sans-serif geometris/grotesk (kemiripan visual dengan Inter atau Helvetica Neue). Satu keluarga font untuk semuanya.
- **Skala (landing)**:
  - Hero H1: 40–48 px, weight 800–900, line-height ±1.05, letter-spacing sedikit rapat.
  - H2 section: 24–28 px, weight 800, line-height 1.2.
  - Judul kartu modul: 12–13 px, weight 700.
  - Body: 12–14 px, weight 400, warna `--text-muted`, line-height 1.6.
- **Skala (dashboard)**:
  - Judul halaman: 20–22 px, weight 700.
  - Subjudul halaman: 12–13 px, `--text-muted`.
  - Angka statistik: 20–24 px, weight 700.
  - Teks tabel dan menu: 12–13 px.
- **Label kapital** (eyebrow, header tabel, label section sidebar, teks tombol): 9–11 px, weight 700, uppercase, letter-spacing 0.06–0.1em.

---

## 4. Layout dan Spacing

- **Grid**: konten landing di-center, lebar maksimum ±1100–1200 px; padding horizontal halaman ±48 px.
- **Skala spacing**: kelipatan 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96).
- **Jarak antar section landing**: 64–96 px.
- **Dashboard**: sidebar kiri tetap ±200–220 px, area konten fluid, padding konten 24–32 px, jarak antar kartu 16 px.
- **Radius**:
  - Tombol: 6–8 px
  - Kartu dan input: 10–12 px
  - Panel besar (perbandingan lama vs baru): 12–16 px
  - Pill status: 999 px
  - Ikon tile: 8–10 px

---

## 5. Elevasi

- Kartu standar: border 1 px `--border` + bayangan sangat tipis (`0 1px 2px rgba(0,0,0,.04)`).
- Mockup/jendela produk di hero: bayangan lebih besar dan lembut (`0 20px 50px rgba(0,0,0,.08)`), sebagian jendela saling menumpuk.
- Latar hero memakai gradien radial peach samar dari kanan atas ke `--bg`.
- Hindari bayangan gelap atau tebal.

---

## 6. Komponen

### Navbar (landing)
- Tinggi ±56 px, latar putih, logo di kiri, tautan di tengah-kiri, CTA di kanan.
- Tautan: uppercase, 10–11 px, weight 700, warna `--text`.
- CTA "MASUK PORTAL →": tombol oranye solid, teks putih uppercase, ikon panah di kanan.

### Logo
- Tile oranye membulat dengan ikon putih, di sampingnya wordmark "klikHadir" (bold, gelap) dan di bawahnya "ENTERPRISE PORTAL" (oranye, uppercase kecil).

### Eyebrow pill
- Teks uppercase kecil dengan titik oranye di depan, latar tint tipis, padding 4×10 px, radius pill. Contoh: "• INTELLIGENT HRIS ARCHITECTURE".

### Tombol
- **Primary**: latar `--primary`, teks putih uppercase 10–11 px bold, padding 12×20 px, radius 6–8 px, boleh ada ikon di kiri (WhatsApp).
- **Secondary**: latar putih, border `--border`, teks `--text`, ukuran sama dengan primary.
- Hover primary: gelapkan sedikit; secondary: latar `--bg`.

### Kartu ringkasan ("RINGKASAN SISTEM")
- Kartu putih, judul kecil uppercase abu, baris key-value: label kiri (`--text`, weight 600), nilai kanan (`--text-muted`, rata kanan). Dipisah jarak vertikal rapat, tanpa garis antar baris.

### Mockup jendela produk (hero)
- Bar atas dengan tiga titik (merah, kuning, hijau), isi berupa skeleton abu muda (blok bulat dan garis). Dua jendela bertumpuk dengan offset.

### Panel perbandingan (Cara Lama vs Dengan klikHadir)
- Dua kolom menyatu dalam satu wadah dengan sudut membulat.
- Kiri: latar `--surface-muted`, judul "CARA LAMA" kapital abu, daftar poin teks abu gelap.
- Kanan: latar `--primary`, judul "DENGAN KLIKHADIR" kapital putih, poin putih.
- Setiap poin diawali tanda strip/bullet kecil.

### Kartu modul
- Ikon dalam tile berwarna (oranye, hijau, kuning) dengan ikon putih, di bawahnya judul bold kecil, deskripsi satu paragraf pendek, dan daftar sub-fitur kecil.
- Satu warna tile per modul untuk membedakan, tapi tetap dari palet semantik.

### Sidebar (dashboard)
- Latar putih, logo di atas, item menu dengan ikon + teks 12–13 px.
- Label grup uppercase kecil abu: OPERASIONAL HRD, KEUANGAN, KONFIGURASI.
- Item aktif: latar `--primary-tint`, teks lebih tebal, penanda vertikal oranye di tepi kiri.
- Profil pengguna di bagian bawah: avatar bulat, nama, email kecil, ikon menu titik tiga.

### Header halaman (dashboard)
- Ikon + judul kapital kecil ("RINGKASAN DASHBOARD", "MANAJEMEN KARYAWAN") di kiri; keterangan "Hak Akses: Super Admin" di kanan atas dengan nilai berwarna oranye.

### Kartu statistik
- Lima kartu sejajar. Isi: label kecil kapital berwarna sesuai status, ikon di kanan atas, angka besar, keterangan kecil di bawah.
- Warna label, ikon, dan latar kartu mengikuti tabel semantik di atas.

### Grafik tren
- Kartu putih, judul "Tren Kehadiran (7 Hari Terakhir)" + subjudul, legenda di kanan atas (titik hijau Tepat Waktu, titik kuning Terlambat), garis grid tipis, sumbu tanggal di bawah.
- Seri: hijau untuk tepat waktu, kuning untuk terlambat.

### Panel aksi cepat (Pending)
- Kartu dengan judul dan badge jumlah antrean (pill kuning), daftar baris: nama, jenis pengajuan (mis. "Cuti: SKD (1 Hari)"), dua tombol ikon kecil — centang hijau (setujui) dan silang merah (tolak).

### Input pencarian
- Latar putih, border `--border`, radius 10 px, ikon pencarian di kiri, placeholder abu ("Cari NIK atau Nama...").

### Tabel karyawan
- Header kolom uppercase kecil abu (mis. STRUKTURAL & GAJI, STATUS), tanpa latar.
- Sel struktur/gaji bertingkat: jabatan (bold), "Gapok Rp 7.500.000" (abu), pill golongan (mis. "Golongan III (Spesialis)") dengan ikon kecil.
- Sel status: pill "Tetap" / "Kontrak" dengan titik oranye, lalu info shift, pajak (TK/0, K/0), dan tanggal gabung dalam teks kecil abu.

### Badge dan pill
- Radius pill, padding 2×8 px, teks 10–11 px bold. Warna mengikuti status: oranye (status kepegawaian), kuning (antrean), hijau/biru/merah (kehadiran).

---

## 7. Ikonografi

- Ikon garis (outline) seragam, tebal stroke konsisten, ukuran 14–16 px di sidebar dan 18–20 px di tile.
- Ikon di tile modul putih di atas latar warna solid; ikon di sidebar abu tua, oranye pada item aktif.

---

## 8. Pola Konten

- Headline: kalimat pernyataan, satu frasa kunci berwarna oranye (mis. "Karyawan & Payroll").
- Section problem-solution: judul berbentuk kalimat yang mengena ke masalah pembaca, lalu perbandingan dua kolom.
- Mata uang: format Rupiah dengan titik pemisah ribuan ("Rp 7.500.000").
- Istilah domain dipakai apa adanya: Gapok, Golongan, TK/K (status pajak), PTKP, SKD, Alpa/Mangkir.

---

## 9. Do dan Don't

**Do**
- Pakai oranye hanya untuk aksi utama, aksen headline, dan elemen aktif.
- Jaga label kapital kecil dengan letter-spacing lebar agar konsisten.
- Biarkan ruang kosong di landing; padatkan hanya di dashboard.
- Pasangkan warna semantik dengan teks atau ikon, jangan hanya warna.

**Don't**
- Jangan tambah warna aksen kedua di luar palet semantik.
- Jangan pakai bayangan tebal atau gradien kontras tinggi.
- Jangan campur lebih dari satu keluarga font.
- Jangan pakai oranye untuk status positif atau negatif; itu tugas hijau dan merah.

---

## 10. Catatan

- Nilai hex, ukuran font, dan radius di atas diperkirakan dari screenshot beresolusi terbatas.
- Teks pada bagian bawah landing (modul ke-3 dan seterusnya) terpotong di screenshot, jadi komponen untuk bagian itu belum tercakup penuh.
- Tidak ada informasi mode gelap, keadaan hover/fokus/disabled, atau tampilan mobile dari screenshot; tambahkan jika dibutuhkan.
