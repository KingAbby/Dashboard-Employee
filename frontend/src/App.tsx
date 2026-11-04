import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './features/auth/RequireAuth';
import { useAuth } from './features/auth/useAuth';
import { homePathFor } from './features/auth/paths';
import { AbsenPage } from './pages/employee/AbsenPage';
import { RiwayatPage } from './pages/employee/RiwayatPage';
import { AbsensiPage } from './pages/admin/AbsensiPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { KaryawanPage } from './pages/admin/KaryawanPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

const EMPLOYEE: ['EMPLOYEE'] = ['EMPLOYEE'];
const ADMIN: ['ADMIN_HRD'] = ['ADMIN_HRD'];

function StartRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth roles={EMPLOYEE} />}>
        <Route element={<AppLayout />}>
          <Route path="/absen" element={<AbsenPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={ADMIN} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/karyawan" element={<KaryawanPage />} />
          <Route path="/admin/absensi" element={<AbsensiPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="/" element={<StartRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
