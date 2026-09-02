import { useQuery } from '@tanstack/react-query';

import type { UsersListQueryParams } from '../types/users-list-params';

import { usersQueryOptions } from '../query-options/users-query-options';

export function useUsers(params: UsersListQueryParams = {}) {
  return useQuery(usersQueryOptions(params));
}
