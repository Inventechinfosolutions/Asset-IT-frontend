import { z } from 'zod';

export const departmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
});

export const paginatedDepartmentsSchema = z.object({
  data: z.array(departmentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  isActive: z.boolean(),
});

export const updateDepartmentSchema = createDepartmentSchema;

export const activeDepartmentsSchema = z.array(z.string());

export const departmentOptionSchema = z.object({
  name: z.string(),
  isActive: z.boolean(),
});

export const departmentOptionsSchema = z.array(departmentOptionSchema);
