import { queryOptions } from '@tanstack/react-query';

import type { DepartmentsListQueryParams } from '../types/departments-list-params';

import { getActiveDepartmentsApi, getDepartmentOptionsApi, getDepartmentsApi } from '../api/departments-api';
import { departmentsKeys } from '../keys/departments-keys';

export const departmentsQueryOptions = (params: DepartmentsListQueryParams = {}) =>
  queryOptions({
    queryKey: departmentsKeys.list(params),
    queryFn: () => getDepartmentsApi(params),
  });

export const activeDepartmentsQueryOptions = () =>
  queryOptions({
    queryKey: departmentsKeys.active(),
    queryFn: () => getActiveDepartmentsApi(),
  });

export const departmentOptionsQueryOptions = () =>
  queryOptions({
    queryKey: departmentsKeys.options(),
    queryFn: () => getDepartmentOptionsApi(),
  });
