import { z } from 'zod';

export const requestStatusSchema = z.enum([
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'FULFILLED',
]);

export const updateableRequestStatusSchema = z.enum([
  'FULFILLED',
  'REJECTED',
  'RESOLVED',
  'CLOSED',
]);

export const requestTypeSchema = z.enum(['ASSET', 'IT_SUPPORT']);

export const supportRequestSchema = z.object({
  id: z.number(),
  userId: z.string().optional(),
  requestType: requestTypeSchema,
  status: requestStatusSchema,
  title: z.string().optional().default(''),
  location: z.string().optional().default(''),
  description: z.string().optional().default(''),
  selectedAssets: z.array(z.string()).nullable().optional(),
  createdAt: z.string(),
});

export const adminSupportRequestSchema = supportRequestSchema.extend({
  user: z
    .object({
      id: z.string(),
      name: z.string().optional().default(''),
      aliasName: z.string(),
    })
    .nullable()
    .optional(),
});

export const paginatedSupportRequestsSchema = z.object({
  data: z.array(supportRequestSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedAdminRequestsSchema = z.object({
  data: z.array(adminSupportRequestSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const createSupportRequestSchema = z.object({
  requestType: requestTypeSchema,
  title: z.string().min(1, 'Title is required').max(200),
  location: z.string().min(1, 'Address/location is required').max(500),
  description: z.string().min(1, 'Description is required').max(2000),
  selectedAssets: z.array(z.string()).optional(),
});

export const createSupportRequestInputSchema = createSupportRequestSchema;
