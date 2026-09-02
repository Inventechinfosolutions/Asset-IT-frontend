import { apiClient } from '@/lib/api-client';
import type { UsersListQueryParams } from '../types/users-list-params';

import {
  managedUserSchema,
  paginatedUsersSchema,
} from '../schemas/user.schema';
import type {
  CreateUserInput,
  ManagedUser,
  PaginatedUsers,
  UpdateUserInput,
} from '../types/user';

function toQueryString(params: UsersListQueryParams = {}): string {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search?.trim()) q.set('search', params.search.trim());
  if (params.isActive !== undefined) {
    q.set('isActive', String(params.isActive));
  }
  if (params.employmentType) {
    q.set('employmentType', params.employmentType);
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

export async function getUsersApi(
  params: UsersListQueryParams = {},
): Promise<PaginatedUsers> {
  const data = await apiClient<PaginatedUsers>(`/users${toQueryString(params)}`);
  return paginatedUsersSchema.parse(data);
}

export async function createUserApi(
  input: CreateUserInput,
): Promise<ManagedUser> {
  const data = await apiClient<ManagedUser>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return managedUserSchema.parse(data);
}

export async function updateUserApi(
  id: string,
  input: UpdateUserInput,
): Promise<ManagedUser> {
  const data = await apiClient<ManagedUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return managedUserSchema.parse(data);
}

export async function resetUserPasswordApi(id: string): Promise<ManagedUser> {
  const data = await apiClient<ManagedUser>(`/users/${id}/reset-password`, {
    method: 'PATCH',
  });
  return managedUserSchema.parse(data);
}
