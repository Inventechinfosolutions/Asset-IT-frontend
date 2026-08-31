import { z } from 'zod';

import {
  notificationSchema,
  notificationTypeSchema,
  notificationsResponseSchema,
} from '../schemas/notification.schema';

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
