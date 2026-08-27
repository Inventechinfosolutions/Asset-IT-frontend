import { z } from 'zod';

export const managedUserSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(''),
  username: z.string(),
  role: z.string(),
  employmentType: z.enum(['PERMANENT', 'CONTRACT']).nullable().optional(),
  empNo: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
});

export const paginatedUsersSchema = z.object({
  data: z.array(managedUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  isPermanent: z.boolean(),
  empNo: z.string().optional(),
  isActive: z.boolean(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6).optional().or(z.literal('')),
  isPermanent: z.boolean(),
  empNo: z.string().optional(),
  isActive: z.boolean(),
});
