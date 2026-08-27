import { useQuery } from '@tanstack/react-query';

import type { ListQueryParams } from '@/types/pagination';

import { usersQueryOptions } from '../query-options/users-query-options';

export function useUsers(params: ListQueryParams = {}) {
  return useQuery(usersQueryOptions(params));
}
