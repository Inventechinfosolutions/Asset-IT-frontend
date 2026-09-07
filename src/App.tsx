import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppProviders } from '@/app/providers/app-providers';
import { AdminLayout, UserLayout } from '@/components/layout';
import {
  ChangePasswordPage,
  homePathForRole,
  LoginPage,
  RequireAdmin,
  RequireFullAdmin,
  RequireUser,
  useAuth,
} from '@/features/auth';
import { DashboardHomePage } from '@/features/dashboard';
import {
  AdminPendingTicketsPage,
  AdminRequestsPage,
  AssignTicketsPage,
  RaiseRequestPage,
  RequestDetailPage,
  UserPortalPage,
} from '@/features/requests';
import { DepartmentsPage } from '@/features/departments';
import { UsersPage } from '@/features/users';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route
              path="/users"
              element={
                <RequireFullAdmin>
                  <UsersPage />
                </RequireFullAdmin>
              }
            />
            <Route
              path="/departments"
              element={
                <RequireFullAdmin>
                  <DepartmentsPage />
                </RequireFullAdmin>
              }
            />
            <Route
              path="/pending-tickets"
              element={
                <RequireFullAdmin>
                  <AdminPendingTicketsPage />
                </RequireFullAdmin>
              }
            />
            <Route
              path="/assign-tickets"
              element={
                <RequireFullAdmin>
                  <AssignTicketsPage />
                </RequireFullAdmin>
              }
            />
            <Route path="/requests" element={<AdminRequestsPage />} />
            <Route
              path="/requests/:id"
              element={<RequestDetailPage isAdmin />}
            />
          </Route>
          <Route
            element={
              <RequireUser>
                <UserLayout />
              </RequireUser>
            }
          >
            <Route path="/portal" element={<UserPortalPage />} />
            <Route path="/portal/raise-request" element={<RaiseRequestPage />} />
            <Route
              path="/portal/requests/:id"
              element={<RequestDetailPage />}
            />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
