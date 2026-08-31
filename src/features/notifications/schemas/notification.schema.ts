import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'REQUEST_CREATED',
  'REQUEST_STATUS_CHANGED',
]);

export const notificationSchema = z.object({
  id: z.number(),
  senderId: z.string().nullable(),
  receiverId: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  requestId: z.number().nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const notificationsResponseSchema = z.object({
  data: z.array(notificationSchema),
  unreadCount: z.number(),
});
