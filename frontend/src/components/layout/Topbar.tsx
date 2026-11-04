import { ROLE_LABEL } from '../../config/brand';
import { formatLongDate } from '../../lib/format';
import type { Role } from '../../types/api';
import { Avatar } from '../ui/Avatar';
import { MenuIcon } from '../ui/icons';

export interface TopbarProps {
  role: Role;
  fullName: string;
  onOpenMenu: () => void;
}

export function Topbar({ role, fullName, onOpenMenu }: TopbarProps) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu"
          className="-ml-1 rounded-md p-1.5 text-muted transition-colors hover:bg-bg hover:text-ink lg:hidden"
        >
          <MenuIcon size={18} />
        </button>
        <p className="label-caps truncate text-[9.5px] text-subtle">{formatLongDate()}</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="hidden text-[10px] text-muted sm:block">
          Hak akses:{' '}
          <span className="label-caps text-[9.5px] text-primary">{ROLE_LABEL[role]}</span>
        </p>
        <span className="hidden h-4 w-px bg-line sm:block" />
        <div className="flex items-center gap-2">
          <span className="hidden max-w-[140px] truncate text-[12px] font-semibold text-ink sm:block">
            {fullName}
          </span>
          <Avatar name={fullName} size="sm" />
        </div>
      </div>
    </div>
  );
}
