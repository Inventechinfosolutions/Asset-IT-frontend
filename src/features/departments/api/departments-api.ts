import { apiClient } from '@/lib/api-client';
import type { DepartmentsListQueryParams } from '../types/departments-list-params';

import {
  activeDepartmentsSchema,
  departmentOptionsSchema,
  departmentSchema,
  paginatedDepartmentsSchema,
} from '../schemas/department.schema';
import type {
  CreateDepartmentInput,
  Department,
  PaginatedDepartments,
  UpdateDepartmentInput,
} from '../types/department';

function toQueryString(params: DepartmentsListQueryParams = {}): string {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search?.trim()) q.set('search', params.search.trim());
  if (params.isActive !== undefined) {
    q.set('isActive', String(params.isActive));
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

export async function getDepartmentsApi(
  params: DepartmentsListQueryParams = {},
): Promise<PaginatedDepartments> {
  const data = await apiClient<PaginatedDepartments>(
    `/departments${toQueryString(params)}`,
  );
  return paginatedDepartmentsSchema.parse(data);
}

export async function getActiveDepartmentsApi(): Promise<string[]> {
  const data = await apiClient<string[]>('/departments/active');
  return activeDepartmentsSchema.parse(data);
}

export async function getDepartmentOptionsApi(): Promise<
  Array<{ name: string; isActive: boolean }>
> {
  const data = await apiClient<Array<{ name: string; isActive: boolean }>>(
    '/departments/options',
  );
  return departmentOptionsSchema.parse(data);
}

export async function createDepartmentApi(
  input: CreateDepartmentInput,
): Promise<Department> {
  const data = await apiClient<Department>('/departments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return departmentSchema.parse(data);
}

export async function updateDepartmentApi(
  id: number,
  input: UpdateDepartmentInput,
): Promise<Department> {
  const data = await apiClient<Department>(`/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return departmentSchema.parse(data);
}
