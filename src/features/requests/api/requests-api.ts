import { apiClient } from '@/lib/api-client';
import type { ListQueryParams } from '@/types/pagination';

import {
  adminSupportRequestSchema,
  paginatedAdminRequestsSchema,
  paginatedSupportRequestsSchema,
  supportRequestSchema,
} from '../schemas/request.schema';
import type {
  AdminSupportRequest,
  CreateSupportRequestInput,
  PaginatedAdminRequests,
  PaginatedSupportRequests,
  SupportRequest,
  UpdateableRequestStatus,
} from '../types/request';

function toQueryString(params: ListQueryParams = {}): string {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search?.trim()) q.set('search', params.search.trim());
  const str = q.toString();
  return str ? `?${str}` : '';
}

export async function fetchAllRequestsApi(
  params: ListQueryParams = {},
): Promise<PaginatedAdminRequests> {
  const data = await apiClient<PaginatedAdminRequests>(
    `/requests${toQueryString(params)}`,
  );
  return paginatedAdminRequestsSchema.parse(data);
}

export async function fetchMyRequestsApi(
  params: ListQueryParams = {},
): Promise<PaginatedSupportRequests> {
  const data = await apiClient<PaginatedSupportRequests>(
    `/requests/mine${toQueryString(params)}`,
  );
  return paginatedSupportRequestsSchema.parse(data);
}

export async function fetchRequestByIdApi(
  id: number,
): Promise<AdminSupportRequest> {
  const data = await apiClient<AdminSupportRequest>(`/requests/${id}`);
  return adminSupportRequestSchema.parse(data);
}

export async function fetchMyRequestByIdApi(
  id: number,
): Promise<AdminSupportRequest> {
  const data = await apiClient<AdminSupportRequest>(`/requests/mine/${id}`);
  return adminSupportRequestSchema.parse(data);
}

export async function createSupportRequestApi(
  payload: CreateSupportRequestInput,
): Promise<SupportRequest> {
  const data = await apiClient<SupportRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return supportRequestSchema.parse(data);
}

export async function updateRequestStatusApi(
  id: number,
  status: UpdateableRequestStatus,
): Promise<SupportRequest> {
  const data = await apiClient<SupportRequest>(`/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return supportRequestSchema.parse(data);
}
