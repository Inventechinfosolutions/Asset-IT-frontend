import type { DepartmentsListQueryParams } from '../types/departments-list-params';

export const departmentsKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentsKeys.all, 'list'] as const,
  list: (params: DepartmentsListQueryParams) =>
    [...departmentsKeys.lists(), params] as const,
  active: () => [...departmentsKeys.all, 'active'] as const,
  options: () => [...departmentsKeys.all, 'options'] as const,
};
