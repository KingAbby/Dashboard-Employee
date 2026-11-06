import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import { hasVisitedBefore, markVisited } from '../lib/session';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

type FormValues = z.infer<typeof schema>;

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
  const [returning] = useState(() => hasVisitedBefore());

  useEffect(() => {
    markVisited();
  }, []);

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
      <section className="relative hidden flex-col overflow-hidden border-r border-line bg-surface px-12 py-10 lg:flex">
        {/* Latar dekoratif: grid halus, glow, dan mark samar. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(10,43,76,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,43,76,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at 32% 38%, black 15%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 32% 38%, black 15%, transparent 72%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full bg-primary-soft/60 blur-3xl"
        />
        <img
          src={BRAND.mark}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-10 h-[340px] w-auto opacity-[0.045]"
        />

        <div className="relative">
          <BrandMark />
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-10">
          <div className="max-w-[460px]">
            <span className="block h-px w-10 bg-primary/40" aria-hidden="true" />

            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.04] tracking-[-0.04em] text-ink">
              Kehadiran yang <br />
              <span className="text-primary">tercatat rapi.</span>
            </h1>

            <p className="mt-5 max-w-[400px] text-[13.5px] leading-relaxed text-muted">
              Absen masuk dan pulang dalam satu portal.
            </p>
          </div>
        </div>

        <p className="relative text-[11px] text-muted">
          Akses khusus karyawan terdaftar. Akun dibuat oleh admin HRD.
        </p>
      </section>

      <section className="flex items-start justify-center px-5 py-10 sm:px-10 lg:items-center lg:py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <p className="label-caps text-subtle">Masuk portal</p>
          <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.025em] text-ink">
            {returning ? 'Selamat datang kembali' : 'Selamat datang'}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted">
            {returning
              ? 'Gunakan email kantor yang diberikan admin HRD.'
              : 'Masuk dengan email kantor dari admin HRD untuk mencatat kehadiran.'}
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
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
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
              className="mt-2 cursor-pointer"
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
