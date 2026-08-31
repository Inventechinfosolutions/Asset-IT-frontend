import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../api/notifications-api';
import { notificationsKeys } from '../keys/notifications-keys';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsKeys.mine(), data);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsKeys.mine(), data);
    },
  });
}
