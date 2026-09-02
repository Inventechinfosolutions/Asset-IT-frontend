export { useAuth } from './hooks/use-auth';
export { AuthProvider } from './components/auth-provider';
export { useLogin } from './hooks/use-login';
export { useChangePassword } from './hooks/use-change-password';
export { useCaptcha } from './hooks/use-captcha';
export { LoginPage } from './components/login-page';
export { ChangePasswordPage } from './components/change-password-page';
export { RequireAdmin, RequireUser } from './components/auth-guards';
export { homePathForRole } from './utils/auth-paths';
export { PasswordInput } from './components/password-input';
export { authKeys } from './keys/auth-keys';
export type {
  AuthUser,
  LoginInput,
  LoginResponse,
  CaptchaResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
} from './types/auth';
export {
  authUserSchema,
  loginInputSchema,
  loginResponseSchema,
  captchaResponseSchema,
  changePasswordInputSchema,
  changePasswordResponseSchema,
} from './schemas/auth.schema';
