import { z } from 'zod';

export const employmentTypeSchema = z.enum(['Permanent', 'Contract']);
export const userRoleSchema = z.enum(['USER', 'TICKET_ASSIGNEE', 'ADMIN']);

export const managedUserSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(''),
  firstName: z.string().optional().default(''),
  lastName: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  department: z.string().optional().default(''),
  employmentType: employmentTypeSchema.optional().default('Permanent'),
  aliasName: z.string(),
  role: userRoleSchema.or(z.string()),
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
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  aliasName: z.string().min(3, 'Alias name must be at least 3 characters'),
  department: z.string().min(1, 'Department is required').max(100),
  employmentType: employmentTypeSchema,
  empNo: z.string().max(50).optional(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional(),
  role: userRoleSchema,
  isActive: z.boolean(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  aliasName: z.string().min(3, 'Alias name must be at least 3 characters'),
  department: z.string().min(1, 'Department is required').max(100),
  employmentType: employmentTypeSchema,
  empNo: z.string().max(50).optional(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional(),
  role: userRoleSchema,
  isActive: z.boolean(),
});
