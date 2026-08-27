import { Navigate } from 'react-router-dom';

import { useAuth } from './auth';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/portal" replace />;
  return children;
}

export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export function homePathForRole(role: string) {
  return role === 'ADMIN' ? '/dashboard' : '/portal';
}
