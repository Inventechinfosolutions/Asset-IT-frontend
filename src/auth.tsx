import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { login as loginApi, type AuthUser } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('accessToken'),
  );
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginApi(username, password);
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
