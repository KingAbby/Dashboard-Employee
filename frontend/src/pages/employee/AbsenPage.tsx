import { ClockIcon } from '../../components/ui/icons';
import { PlaceholderPage } from '../PlaceholderPage';

export function AbsenPage() {
  return (
    <PlaceholderPage
      eyebrow="Absensi WFH"
      title="Absen hari ini"
      description="Status absen hari ini, tombol absen masuk/pulang, dan komponen foto bukti."
      icon={<ClockIcon size={18} />}
      upcoming={[
        'Tombol absen masuk dan pulang dengan jam dari server (WIB).',
        'Komponen PhotoCapture: pilih file atau kamera, preview, validasi tipe dan ukuran.',
        'Status ON_TIME / LATE serta ringkasan riwayat beberapa hari terakhir.',
      ]}
    />
  );
}
