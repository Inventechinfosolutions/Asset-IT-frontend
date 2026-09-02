import { apiClient } from '@/lib/api-client';

import {
  captchaResponseSchema,
  changePasswordResponseSchema,
  loginResponseSchema,
} from '../schemas/auth.schema';
import type {
  CaptchaResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
  LoginInput,
  LoginResponse,
} from '../types/auth';

export async function getCaptcha(): Promise<CaptchaResponse> {
  const data = await apiClient<unknown>(`/auth/captcha?refresh=${Date.now()}`);
  return captchaResponseSchema.parse(data);
}

export async function loginApi(credentials: LoginInput): Promise<LoginResponse> {
  const data = await apiClient<unknown>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return loginResponseSchema.parse(data);
}

export async function changePasswordApi(
  input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  const data = await apiClient<unknown>('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return changePasswordResponseSchema.parse(data);
}
