import { queryOptions } from '@tanstack/react-query';

import { getUsersApi } from '../api/users-api';
import { usersKeys } from '../keys/users-keys';
import type { UsersListQueryParams } from '../types/users-list-params';

export const usersQueryOptions = (params: UsersListQueryParams = {}) =>
  queryOptions({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsersApi(params),
  });
