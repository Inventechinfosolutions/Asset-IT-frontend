import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';
import { isAdminPortalRole, isFullAdmin } from '../utils/auth-paths';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (!isAdminPortalRole(user.role)) {
    return <Navigate to="/portal" replace />;
  }
  return <>{children}</>;
}

export function RequireFullAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (!isFullAdmin(user.role)) {
    return <Navigate to="/requests" replace />;
  }
  return <>{children}</>;
}

export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (isAdminPortalRole(user.role)) {
    return <Navigate to={user.role === 'TICKET_ASSIGNEE' ? '/requests' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}
