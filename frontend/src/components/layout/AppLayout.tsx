import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setLogoutOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const requestLogout = () => {
    setMobileOpen(false);
    setLogoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar
          role={user.role}
          fullName={user.fullName}
          email={user.email}
          activePath={location.pathname}
          onLogout={requestLogout}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
          />
          <div className="relative h-full w-[232px] shadow-[8px_0_30px_rgba(28,29,31,0.15)]">
            <Sidebar
              role={user.role}
              fullName={user.fullName}
              email={user.email}
              activePath={location.pathname}
              onLogout={requestLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[232px]">
        <Topbar role={user.role} fullName={user.fullName} onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari akun?"
        description="Sesi kamu akan diakhiri dan kamu perlu login lagi untuk membuka portal."
        confirmLabel="Ya, keluar"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
}
