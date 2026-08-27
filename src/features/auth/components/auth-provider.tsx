import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loginApi } from '../api/login';
import { AuthContext } from '../hooks/use-auth';
import type { AuthUser, LoginInput } from '../types/auth';

function readStoredUser(): AuthUser | null {
  try {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
