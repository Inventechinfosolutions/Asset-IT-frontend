import { apiClient } from '@/lib/api-client';

import { captchaResponseSchema, loginResponseSchema } from '../schemas/auth.schema';
import type { CaptchaResponse, LoginInput, LoginResponse } from '../types/auth';

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
