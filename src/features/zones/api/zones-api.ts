import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

export const zonesSchema = z.array(z.string());

export async function getZonesApi(): Promise<string[]> {
  const data = await apiClient<string[]>('/zones');
  return zonesSchema.parse(data);
}
