import { HistoryIcon } from '../../components/ui/icons';
import { PlaceholderPage } from '../PlaceholderPage';

export function RiwayatPage() {
  return (
    <PlaceholderPage
      eyebrow="Riwayat absensi"
      title="Riwayat saya"
      description="Daftar absensi milik sendiri, lengkap dengan filter tanggal dan pratinjau foto."
      icon={<HistoryIcon size={18} />}
      upcoming={[
        'Tabel riwayat dengan pagination dan filter rentang tanggal.',
        'Pratinjau foto absen masuk dan pulang lewat endpoint terautentikasi.',
      ]}
    />
  );
}
