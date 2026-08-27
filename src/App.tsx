import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppProviders } from '@/app/providers/app-providers';
import { AdminLayout, UserLayout } from '@/components/layout';
import {
  homePathForRole,
  LoginPage,
  RequireAdmin,
  RequireUser,
  useAuth,
} from '@/features/auth';
import { DashboardHomePage } from '@/features/dashboard';
import { AdminRequestsPage, UserPortalPage } from '@/features/requests';
import { UsersPage } from '@/features/users';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/requests" element={<AdminRequestsPage />} />
            <Route path="/requests/:id" element={<Navigate to="/requests" replace />} />
          </Route>

          <Route
            element={
              <RequireUser>
                <UserLayout />
              </RequireUser>
            }
          >
            <Route path="/portal" element={<UserPortalPage />} />
            <Route
              path="/portal/requests/:id"
              element={<Navigate to="/portal" replace />}
            />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
