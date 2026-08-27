import { z } from 'zod';

import {
  authUserSchema,
  loginInputSchema,
  loginResponseSchema,
} from '../schemas/auth.schema';

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
