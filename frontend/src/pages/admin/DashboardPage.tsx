import { GridIcon } from '../../components/ui/icons';
import { PlaceholderPage } from '../PlaceholderPage';

export function DashboardPage() {
  return (
    <PlaceholderPage
      eyebrow="Ringkasan"
      title="Ringkasan kehadiran"
      description="Ringkasan opsional: jumlah hadir, terlambat, dan belum absen hari ini."
      icon={<GridIcon size={18} />}
      upcoming={[
        'Kartu statistik harian dengan warna semantik.',
        'Daftar karyawan yang belum absen hari ini.',
      ]}
    />
  );
}
