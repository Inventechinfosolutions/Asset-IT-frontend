import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

export const activeAssetsSchema = z.array(z.string());

export async function getActiveAssetsApi(): Promise<string[]> {
  const data = await apiClient<string[]>('/assets/active');
  return activeAssetsSchema.parse(data);
}
