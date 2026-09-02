import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { loginApi } from '../api/login';
import { AuthContext } from '../hooks/use-auth';
import { authKeys } from '../keys/auth-keys';
import { notificationsKeys } from '@/features/notifications';
import type { AuthUser, LoginInput } from '../types/auth';

function readStoredUser(): AuthUser | null {
  try {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.role) return null;
    return {
      ...parsed,
      mustChangePassword: Boolean(parsed.mustChangePassword),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('accessToken'),
  );
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback(async (credentials: LoginInput) => {
    const result = await loginApi(credentials);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    queryClient.removeQueries({ queryKey: authKeys.captchaRoot() });
    queryClient.removeQueries({ queryKey: notificationsKeys.all });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, [queryClient]);

  const setMustChangePassword = useCallback((value: boolean) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, mustChangePassword: value };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout, setMustChangePassword }),
    [user, token, login, logout, setMustChangePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
