import { z } from 'zod';

export const requestStatusSchema = z.enum([
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'PENDING_USER',
  'PENDING_VENDOR',
  'ON_HOLD',
  'RESOLVED',
  'CLOSED',
  'FULFILLED',
]);

export const updateableRequestStatusSchema = z.enum([
  'IN_PROGRESS',
  'PENDING_USER',
  'PENDING_VENDOR',
  'ON_HOLD',
  'FULFILLED',
  'REJECTED',
  'RESOLVED',
  'CLOSED',
]);

export const requestTypeSchema = z.enum(['ASSET', 'IT_SUPPORT']);

export const selectedAssetLineSchema = z.object({
  assetType: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
});

const selectedAssetsSchema = z.preprocess((value) => {
  if (!Array.isArray(value)) return value;
  return value.map((item) => {
    if (typeof item === 'string') {
      return { assetType: item, name: item, quantity: 1 };
    }
    return item;
  });
}, z.array(selectedAssetLineSchema).nullable().optional());

export const supportRequestSchema = z.object({
  id: z.number(),
  requestCode: z.string().nullable().optional(),
  userId: z.string().optional(),
  requestType: requestTypeSchema,
  status: requestStatusSchema,
  title: z.string().optional().default(''),
  zone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  description: z.string().optional().default(''),
  selectedAssets: selectedAssetsSchema,
  adminComment: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const adminSupportRequestSchema = supportRequestSchema.extend({
  assigneeId: z.string().nullable().optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string().optional().default(''),
      aliasName: z.string(),
      department: z.string().optional().default(''),
      empNo: z.string().nullable().optional().default(''),
    })
    .nullable()
    .optional(),
  assignee: z
    .object({
      id: z.string(),
      name: z.string().optional().default(''),
      aliasName: z.string(),
      department: z.string().optional().default(''),
      empNo: z.string().nullable().optional().default(''),
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
  zone: z.string().min(1, 'Zone is required'),
  location: z.string().min(1, 'Address/location is required').max(500),
  description: z.string().max(2000).optional().default(''),
  selectedAssets: z.array(selectedAssetLineSchema).optional(),
});

export const createSupportRequestInputSchema = createSupportRequestSchema;
