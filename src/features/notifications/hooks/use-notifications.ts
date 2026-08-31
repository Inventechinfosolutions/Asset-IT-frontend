import { useQuery } from '@tanstack/react-query';

import { notificationsQueryOptions } from '../query-options/notifications-query-options';

export function useNotifications(receiverId: string) {
  return useQuery(notificationsQueryOptions(receiverId));
}
