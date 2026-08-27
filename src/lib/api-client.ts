import { env } from '@/config/env';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${env.VITE_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const rawData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (Array.isArray(rawData?.message)
        ? rawData.message.join(', ')
        : rawData?.message) ||
      response.statusText ||
      'An unexpected error occurred';
    throw new ApiError(message, response.status, rawData);
  }

  return rawData as T;
}
