import { z } from 'zod';

import {
  adminSupportRequestSchema,
  createSupportRequestSchema,
  paginatedAdminRequestsSchema,
  paginatedSupportRequestsSchema,
  requestStatusSchema,
  requestTypeSchema,
  supportRequestSchema,
  updateableRequestStatusSchema,
} from '../schemas/request.schema';

export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type UpdateableRequestStatus = z.infer<
  typeof updateableRequestStatusSchema
>;
export type RequestType = z.infer<typeof requestTypeSchema>;
export type SupportRequest = z.infer<typeof supportRequestSchema>;
export type AdminSupportRequest = z.infer<typeof adminSupportRequestSchema>;
export type PaginatedSupportRequests = z.infer<
  typeof paginatedSupportRequestsSchema
>;
export type PaginatedAdminRequests = z.infer<
  typeof paginatedAdminRequestsSchema
>;
export type CreateSupportRequestInput = z.infer<
  typeof createSupportRequestSchema
>;
