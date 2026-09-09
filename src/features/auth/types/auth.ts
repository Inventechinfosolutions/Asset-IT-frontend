import { z } from 'zod';

import {
  authUserSchema,
  changePasswordInputSchema,
  changePasswordResponseSchema,
  loginInputSchema,
  loginResponseSchema,
} from '../schemas/auth.schema';

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
export type ChangePasswordResponse = z.infer<
  typeof changePasswordResponseSchema
>;
