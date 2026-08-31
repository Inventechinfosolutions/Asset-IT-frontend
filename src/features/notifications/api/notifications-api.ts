import { apiClient } from '@/lib/api-client';

import { notificationsResponseSchema } from '../schemas/notification.schema';
import type { NotificationsResponse } from '../types/notification';

export async function fetchNotificationsApi(): Promise<NotificationsResponse> {
  const data = await apiClient<NotificationsResponse>('/notifications');
  return notificationsResponseSchema.parse(data);
}

export async function markNotificationReadApi(
  id: number,
): Promise<NotificationsResponse> {
  const data = await apiClient<NotificationsResponse>(
    `/notifications/${id}/read`,
    { method: 'PATCH' },
  );
  return notificationsResponseSchema.parse(data);
}

export async function markAllNotificationsReadApi(): Promise<NotificationsResponse> {
  const data = await apiClient<NotificationsResponse>(
    '/notifications/read-all',
    { method: 'PATCH' },
  );
  return notificationsResponseSchema.parse(data);
}
