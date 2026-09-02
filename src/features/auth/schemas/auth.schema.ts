import { z } from 'zod';

export const loginInputSchema = z.object({
  aliasName: z.string().min(1, 'Alias name is required'),
  password: z.string().min(1, 'Password is required'),
  captchaId: z.string().min(1, 'CAPTCHA is required'),
  captchaAnswer: z.string().min(1, 'CAPTCHA answer is required'),
});

export const captchaResponseSchema = z.object({
  captchaId: z.string(),
  image: z.string(),
  expiresIn: z.number(),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliasName: z.string(),
  role: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
