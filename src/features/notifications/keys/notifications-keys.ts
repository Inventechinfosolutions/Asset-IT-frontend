export const notificationsKeys = {
  all: ['notifications'] as const,
  mine: (receiverId: string) =>
    [...notificationsKeys.all, 'mine', receiverId] as const,
};
