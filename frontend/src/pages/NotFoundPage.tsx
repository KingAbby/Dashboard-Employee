import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="label-caps text-primary">404</span>
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-2 max-w-md text-[13px] text-muted">
          Alamat yang Anda buka tidak ada di {BRAND.name}. Kembali ke halaman awal sesuai peran akun Anda.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex h-10 items-center justify-center rounded-btn border border-primary bg-primary px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-primary-strong hover:bg-primary-strong"
      >
        Ke halaman awal
      </Link>
    </div>
  );
}
