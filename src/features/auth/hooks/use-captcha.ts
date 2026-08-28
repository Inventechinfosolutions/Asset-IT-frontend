import { useQuery } from '@tanstack/react-query';

import { captchaQueryOptions } from '../query-options/auth-query-options';

export function useCaptcha(refreshKey: number) {
  return useQuery(captchaQueryOptions(refreshKey));
}
