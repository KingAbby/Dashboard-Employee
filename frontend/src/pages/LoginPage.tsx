import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  AlertIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SparkIcon,
} from '../components/ui/icons';
import { BRAND } from '../config/brand';
import { useAuth } from '../features/auth/useAuth';
import { homePathFor } from '../features/auth/paths';
import { toErrorMessage } from '../lib/api';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

type FormValues = z.infer<typeof schema>;

const HIGHLIGHTS = [
  {
    index: '01',
    title: 'Foto bukti, bukan sekadar centang',
    body: 'Setiap absen masuk menyertakan foto dan waktu dari server, jadi tidak bisa diakali dari perangkat.',
  },
  {
    index: '02',
    title: 'Satu catatan per hari',
    body: 'Absen ganda ditolak. Status tepat waktu atau terlambat dihitung otomatis dari jam masuk.',
  },
  {
    index: '03',
    title: 'HRD memantau tanpa mengubah',
    body: 'Admin HRD melihat seluruh absensi beserta fotonya, tetapi tidak bisa mengedit riwayat karyawan.',
  },
];

const FACTS = [
  { label: 'Zona waktu', value: 'WIB · Asia/Jakarta' },
  { label: 'Bukti absen', value: 'Foto wajib' },
  { label: 'Pencatatan', value: 'Waktu dari server' },
];

const DEMO_ACCOUNTS = [
  { label: 'Admin HRD', email: 'admin@example.com', password: 'Admin123!' },
  { label: 'Karyawan', email: 'budi@example.com', password: 'Employee123!' },
];

const BrandMark = () => (
  <span className="flex flex-col gap-1">
    <img
      src={BRAND.logo}
      alt={`${BRAND.name} — ${BRAND.tagline}`}
      width={535}
      height={128}
      className="h-9 w-auto self-start"
    />
    <span className="label-caps block pl-0.5 text-[8px] text-primary">{BRAND.tagline}</span>
  </span>
);

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  const from = (location.state as { from?: string } | null)?.from;

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const account = await login(values.email.trim(), values.password);
      const home = homePathFor(account.role);
      const target = from && from.startsWith(home) ? from : home;
      navigate(target, { replace: true });
    } catch (error) {
      setFormError(toErrorMessage(error));
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.08fr_1fr]">
      <section className="relative hidden flex-col border-r border-line bg-surface px-12 py-10 lg:flex">
        <BrandMark />

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="w-full max-w-[520px]">
            <p className="label-caps flex items-center gap-2 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Kehadiran tanpa kertas
            </p>

            <h1 className="mt-4 text-[40px] font-extrabold leading-[1.06] tracking-[-0.035em] text-ink">
              Absensi WFH yang{' '}
              <span className="whitespace-nowrap rounded-[4px] bg-primary-soft px-2 py-1 text-primary">
                tercatat rapi
              </span>
              , <span className="whitespace-nowrap">bukan tebak-tebakan</span>.
            </h1>

            <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
              Satu portal untuk dua peran: karyawan absen dengan foto bukti, admin HRD memantau
              kehadiran harian dari satu tabel yang sama.
            </p>

            <ul className="mt-9 border-b border-line">
              {HIGHLIGHTS.map((item) => (
                <li key={item.index} className="border-t border-line py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="label-caps text-[9.5px] text-subtle">{item.index}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="label-caps text-[9px] text-subtle">{fact.label}</dt>
                <dd className="mt-1 text-[12px] font-semibold text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] text-subtle">
            Hanya untuk karyawan terdaftar. Akun dibuat oleh admin HRD.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <p className="label-caps text-subtle">Masuk portal</p>
          <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.025em] text-ink">
            Selamat datang kembali
          </h2>
          <p className="mt-1.5 text-[13px] text-muted">
            Gunakan email kantor yang diberikan admin HRD.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-4">
            {formError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-card border border-danger/25 bg-danger-tint px-3 py-2.5"
              >
                <span className="mt-0.5 text-danger">
                  <AlertIcon size={15} />
                </span>
                <p className="text-[12px] font-medium leading-relaxed text-danger">{formError}</p>
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="nama@perusahaan.com"
              icon={<MailIcon size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              icon={<LockIcon size={15} />}
              error={errors.password?.message}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              }
              {...register('password')}
            />

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              iconRight={<ArrowRightIcon size={14} />}
              className="mt-2"
            >
              {isSubmitting ? 'Memeriksa…' : 'Masuk ke portal'}
            </Button>
          </form>

          <div className="mt-6 rounded-card border border-line bg-surface p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <SparkIcon size={13} className="text-primary" />
              Akun demo untuk mencoba
            </p>
            <div className="mt-2 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setValue('email', account.email, { shouldValidate: true });
                    setValue('password', account.password, { shouldValidate: true });
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-[7px] border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-bg"
                >
                  <span className="text-[11.5px] font-semibold text-ink">{account.label}</span>
                  <span className="truncate text-[11px] text-subtle">{account.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-subtle">
            Lupa password? Hubungi admin HRD untuk pengaturan ulang.
          </p>
        </div>
      </section>
    </div>
  );
}
