import { useQuery } from '@tanstack/react-query';

import type { ListQueryParams } from '@/types/pagination';

import {
  allRequestsQueryOptions,
  myRequestDetailQueryOptions,
  myRequestsQueryOptions,
  requestDetailQueryOptions,
} from '../query-options/requests-query-options';

export function useAllRequests(params: ListQueryParams = {}) {
  return useQuery(allRequestsQueryOptions(params));
}

export function useMyRequests(params: ListQueryParams = {}) {
  return useQuery(myRequestsQueryOptions(params));
}

export function useRequestDetail(id: number) {
  return useQuery(requestDetailQueryOptions(id));
}

export function useMyRequestDetail(id: number) {
  return useQuery(myRequestDetailQueryOptions(id));
}
