import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  GridIcon,
  HistoryIcon,
  LogOutIcon,
  UsersIcon,
} from '../ui/icons';
import { cn } from '../../lib/cn';
import { NAV_GROUPS } from '../../config/brand';
import type { Role } from '../../types/api';
import { Avatar } from '../ui/Avatar';

const ICONS: Record<string, (props: { size?: number }) => ReactNode> = {
  clock: ClockIcon,
  history: HistoryIcon,
  grid: GridIcon,
  users: UsersIcon,
  calendar: CalendarIcon,
};

export interface SidebarProps {
  role: Role;
  fullName: string;
  email: string;
  activePath: string;
  onNavigate?: () => void;
  onLogout: () => void;
}

export function Sidebar({ role, fullName, email, activePath, onNavigate, onLogout }: SidebarProps) {
  const groups = NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => item.roles.some((itemRole) => itemRole === role)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="flex h-full w-[232px] flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-[18px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-bright shadow-[0_2px_6px_rgba(10,43,76,0.25)]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5.5 12.5 4.2 4.2L18.5 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-extrabold leading-none tracking-[-0.02em] text-ink">
            hadirku
          </span>
          <span className="label-caps mt-1 block text-[8px] text-primary">Portal Kehadiran</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2" aria-label="Menu utama">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="label-caps px-2 pb-2 text-[9px] text-subtle">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] ?? GridIcon;
                const active = activePath === item.to || activePath.startsWith(`${item.to}/`);

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={active ? 'page' : undefined}
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[12.5px] transition-colors',
                        active
                          ? 'bg-primary-tint font-semibold text-ink'
                          : 'font-medium text-muted hover:bg-bg hover:text-ink',
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
                      ) : null}
                      <span className={active ? 'text-primary-strong' : 'text-subtle group-hover:text-muted'}>
                        <Icon size={16} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-[9px] px-1.5 py-1.5">
          <Avatar name={fullName} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-ink">{fullName}</span>
            <span className="block truncate text-[10.5px] text-subtle">{email}</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar"
            className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-muted hover:text-danger"
          >
            <LogOutIcon size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
