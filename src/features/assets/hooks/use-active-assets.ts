import { queryOptions, useQuery } from '@tanstack/react-query';

import { getActiveAssetsApi } from '../api/assets-api';

export const assetsKeys = {
  all: ['assets'] as const,
  active: () => [...assetsKeys.all, 'active'] as const,
};

export const activeAssetsQueryOptions = () =>
  queryOptions({
    queryKey: assetsKeys.active(),
    queryFn: () => getActiveAssetsApi(),
  });

export function useActiveAssets(enabled = true) {
  return useQuery({
    ...activeAssetsQueryOptions(),
    enabled,
  });
}
