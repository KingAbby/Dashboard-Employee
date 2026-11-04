import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { homePathFor } from './paths';
import type { Role } from '../../types/api';

export interface RequireAuthProps {
  roles?: Role[];
}

/**
 * Route guard: belum login → /login, role tidak cocok → halaman utama
 * role-nya sendiri (bukan halaman error kosong).
 */
export function RequireAuth({ roles }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}
