import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './auth';
import { homePathForRole, RequireAdmin, RequireUser } from './auth-guards';
import { AdminLayout } from './layout/AdminLayout';
import { UserLayout } from './layout/UserLayout';
import { AdminRequestDetailPage } from './pages/AdminRequestDetailPage';
import { AdminRequestsPage } from './pages/AdminRequestsPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { LoginPage } from './pages/LoginPage';
import { UserPortalPage } from './pages/UserPortalPage';
import { UserRequestDetailPage } from './pages/UserRequestDetailPage';
import { UsersPage } from './pages/UsersPage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="/requests/:id" element={<AdminRequestDetailPage />} />
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
              element={<UserRequestDetailPage />}
            />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
