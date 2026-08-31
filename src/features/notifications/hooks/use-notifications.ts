import { useQuery } from '@tanstack/react-query';

import { notificationsQueryOptions } from '../query-options/notifications-query-options';

export function useNotifications() {
  return useQuery(notificationsQueryOptions());
}
