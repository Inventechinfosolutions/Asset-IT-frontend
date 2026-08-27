import { z } from 'zod';

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  role: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
