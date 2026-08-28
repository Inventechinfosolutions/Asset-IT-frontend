import { queryOptions } from '@tanstack/react-query';

import { getCaptcha } from '../api/login';
import { authKeys } from '../keys/auth-keys';

export function captchaQueryOptions(refreshKey: number) {
  return queryOptions({
    queryKey: authKeys.captcha(refreshKey),
    queryFn: getCaptcha,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
