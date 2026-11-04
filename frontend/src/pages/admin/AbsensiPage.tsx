import { CalendarIcon } from '../../components/ui/icons';
import { PlaceholderPage } from '../PlaceholderPage';

export function AbsensiPage() {
  return (
    <PlaceholderPage
      eyebrow="Monitoring absensi"
      title="Absensi seluruh karyawan"
      description="Admin HRD memantau absensi yang sudah disubmit: hanya baca, tanpa kemampuan mengubah atau menghapus."
      icon={<CalendarIcon size={18} />}
      upcoming={[
        'Tabel absensi dengan filter tanggal, karyawan, dan status kehadiran.',
        'Kolom foto yang membuka modal pratinjau dengan foto masuk dan pulang.',
        'Komposisi nama karyawan dari identity service saat data ditampilkan.',
      ]}
    />
  );
}
