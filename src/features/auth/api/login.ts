import { apiClient } from '@/lib/api-client';

import { loginResponseSchema } from '../schemas/auth.schema';
import type { LoginInput, LoginResponse } from '../types/auth';

export async function loginApi(credentials: LoginInput): Promise<LoginResponse> {
  const data = await apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return loginResponseSchema.parse(data);
}
