export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  captchaRoot: () => [...authKeys.all, 'captcha'] as const,
  captcha: (refreshKey: number) =>
    [...authKeys.all, 'captcha', refreshKey] as const,
};
