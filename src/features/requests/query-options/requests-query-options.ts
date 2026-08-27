import { queryOptions } from '@tanstack/react-query';

import type { ListQueryParams } from '@/types/pagination';

import {
  fetchAllRequestsApi,
  fetchMyRequestByIdApi,
  fetchMyRequestsApi,
  fetchRequestByIdApi,
} from '../api/requests-api';
import { requestsKeys } from '../keys/requests-keys';

export const allRequestsQueryOptions = (params: ListQueryParams = {}) =>
  queryOptions({
    queryKey: requestsKeys.adminList(params),
    queryFn: () => fetchAllRequestsApi(params),
  });

export const myRequestsQueryOptions = (params: ListQueryParams = {}) =>
  queryOptions({
    queryKey: requestsKeys.myList(params),
    queryFn: () => fetchMyRequestsApi(params),
  });

export const requestDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: requestsKeys.adminDetail(id),
    queryFn: () => fetchRequestByIdApi(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const myRequestDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: requestsKeys.myDetail(id),
    queryFn: () => fetchMyRequestByIdApi(id),
    enabled: Number.isFinite(id) && id > 0,
  });
