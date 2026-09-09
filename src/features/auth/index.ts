export { useAuth } from './hooks/use-auth';
export { AuthProvider } from './components/auth-provider';
export { useLogin } from './hooks/use-login';
export { useChangePassword } from './hooks/use-change-password';
export { LoginPage } from './components/login-page';
export { ChangePasswordPage } from './components/change-password-page';
export {
  RequireAdmin,
  RequireFullAdmin,
  RequireUser,
} from './components/auth-guards';
export {
  formatUserRole,
  homePathForRole,
  isAdminPortalRole,
  isFullAdmin,
  portalLabelForRole,
} from './utils/auth-paths';
export { PasswordInput } from './components/password-input';
export { authKeys } from './keys/auth-keys';
export type {
  AuthUser,
  LoginInput,
  LoginResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
} from './types/auth';
export {
  authUserSchema,
  loginInputSchema,
  loginResponseSchema,
  changePasswordInputSchema,
  changePasswordResponseSchema,
} from './schemas/auth.schema';
