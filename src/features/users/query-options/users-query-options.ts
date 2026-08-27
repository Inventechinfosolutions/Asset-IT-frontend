import { queryOptions } from '@tanstack/react-query';

import type { ListQueryParams } from '@/types/pagination';

import { getUsersApi } from '../api/users-api';
import { usersKeys } from '../keys/users-keys';

export const usersQueryOptions = (params: ListQueryParams = {}) =>
  queryOptions({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsersApi(params),
  });
