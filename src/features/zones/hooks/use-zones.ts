import { queryOptions, useQuery } from '@tanstack/react-query';

import { getZonesApi } from '../api/zones-api';

export const zonesKeys = {
  all: ['zones'] as const,
  list: () => [...zonesKeys.all, 'list'] as const,
};

export const zonesQueryOptions = () =>
  queryOptions({
    queryKey: zonesKeys.list(),
    queryFn: () => getZonesApi(),
  });

export function useZones(enabled = true) {
  return useQuery({
    ...zonesQueryOptions(),
    enabled,
  });
}
