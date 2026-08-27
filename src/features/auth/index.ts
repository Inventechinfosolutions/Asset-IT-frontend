export { useAuth } from './hooks/use-auth';
export { AuthProvider } from './components/auth-provider';
export { useLogin } from './hooks/use-login';
export { LoginPage } from './components/login-page';
export { RequireAdmin, RequireUser } from './components/auth-guards';
export { homePathForRole } from './utils/auth-paths';
export { PasswordInput } from './components/password-input';
export { authKeys } from './keys/auth-keys';
export type { AuthUser, LoginInput, LoginResponse } from './types/auth';
export {
  authUserSchema,
  loginInputSchema,
  loginResponseSchema,
} from './schemas/auth.schema';
