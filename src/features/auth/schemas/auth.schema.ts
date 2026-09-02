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
  mustChangePassword: z.boolean().optional().default(false),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

export const changePasswordInputSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'New password must be at most 100 characters'),
    confirmNewPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'New password must be different from the old password',
    path: ['newPassword'],
  });

export const changePasswordResponseSchema = z.object({
  mustChangePassword: z.boolean(),
});
