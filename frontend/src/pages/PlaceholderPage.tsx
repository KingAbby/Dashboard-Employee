import type { ReactNode } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ClockIcon } from '../components/ui/icons';

export interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  upcoming: string[];
  icon?: ReactNode;
}

/**
 * Halaman yang modulnya dikerjakan pada tahap berikutnya. Tetap dirender
 * dengan layout dan gaya yang sama supaya navigasi terasa utuh.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  upcoming,
  icon = <ClockIcon size={18} />,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card className="border-dashed bg-surface/70">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold text-ink">Modul ini disiapkan pada tahap berikutnya</p>
              <Badge tone="warning">Belum aktif</Badge>
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Struktur halaman, navigasi, dan styling sudah siap. Isi modul ditambahkan di tahap 3–4
              sesuai rencana kerja.
            </p>
            <ul className="mt-3 space-y-1.5">
              {upcoming.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-muted">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
