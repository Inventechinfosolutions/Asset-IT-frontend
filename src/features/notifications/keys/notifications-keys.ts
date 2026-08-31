export const notificationsKeys = {
  all: ['notifications'] as const,
  mine: () => [...notificationsKeys.all, 'mine'] as const,
};
