import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../api/notifications-api';
import { notificationsKeys } from '../keys/notifications-keys';

export function useMarkNotificationRead(receiverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsKeys.mine(receiverId), data);
    },
  });
}

export function useMarkAllNotificationsRead(receiverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsKeys.mine(receiverId), data);
    },
  });
}
