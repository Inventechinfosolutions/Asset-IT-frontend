import { queryOptions } from '@tanstack/react-query';

import { fetchNotificationsApi } from '../api/notifications-api';
import { notificationsKeys } from '../keys/notifications-keys';

export const notificationsQueryOptions = (receiverId: string) =>
  queryOptions({
    queryKey: notificationsKeys.mine(receiverId),
    queryFn: () => fetchNotificationsApi(receiverId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
