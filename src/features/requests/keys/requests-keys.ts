import type { ListQueryParams } from '@/types/pagination';

export const requestsKeys = {
  all: ['requests'] as const,
  lists: () => [...requestsKeys.all, 'list'] as const,
  adminList: (params: ListQueryParams) =>
    [...requestsKeys.lists(), 'admin', params] as const,
  myList: (params: ListQueryParams) =>
    [...requestsKeys.lists(), 'mine', params] as const,
  details: () => [...requestsKeys.all, 'detail'] as const,
  adminDetail: (id: number) =>
    [...requestsKeys.details(), 'admin', id] as const,
  myDetail: (id: number) => [...requestsKeys.details(), 'mine', id] as const,
};
