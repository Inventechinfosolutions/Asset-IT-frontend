import { queryOptions } from '@tanstack/react-query';

import { fetchNotificationsApi } from '../api/notifications-api';
import { notificationsKeys } from '../keys/notifications-keys';

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: notificationsKeys.mine(),
    queryFn: fetchNotificationsApi,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
