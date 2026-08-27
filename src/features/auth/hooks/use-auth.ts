import { createContext, useContext } from 'react';

import type { AuthUser, LoginInput } from '../types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginInput) => Promise<AuthUser>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
