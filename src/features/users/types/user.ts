import { z } from 'zod';

import {
  createUserSchema,
  managedUserSchema,
  paginatedUsersSchema,
  updateUserSchema,
} from '../schemas/user.schema';

export type ManagedUser = z.infer<typeof managedUserSchema>;
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
