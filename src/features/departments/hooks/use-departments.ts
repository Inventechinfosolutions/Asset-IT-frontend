import { useQuery } from '@tanstack/react-query';

import type { DepartmentsListQueryParams } from '../types/departments-list-params';

import {
  activeDepartmentsQueryOptions,
  departmentOptionsQueryOptions,
  departmentsQueryOptions,
} from '../query-options/departments-query-options';

export function useDepartments(params: DepartmentsListQueryParams = {}) {
  return useQuery(departmentsQueryOptions(params));
}

export function useActiveDepartments() {
  return useQuery(activeDepartmentsQueryOptions());
}

export function useDepartmentOptions(enabled = true) {
  return useQuery({
    ...departmentOptionsQueryOptions(),
    enabled,
  });
}
