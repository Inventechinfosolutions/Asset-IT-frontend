const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: string;
};

export type ManagedUser = {
  id: string;
  name: string;
  username: string;
  role: string;
  employmentType: 'PERMANENT' | 'CONTRACT' | null;
  empNo: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toQuery(params: ListQuery = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search?.trim()) q.set('search', params.search.trim());
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (Array.isArray(data.message) ? data.message.join(', ') : data.message) ||
      'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<{ accessToken: string; user: AuthUser }>(res);
}

export async function fetchUsers(params: ListQuery = {}) {
  const res = await fetch(`${API_BASE}/users${toQuery(params)}`, {
    headers: authHeaders(),
  });
  return handleResponse<Paginated<ManagedUser>>(res);
}

export async function createUser(payload: {
  username: string;
  password: string;
  isPermanent: boolean;
  empNo?: string;
  isActive: boolean;
}) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ManagedUser>(res);
}

export async function updateUser(
  id: string,
  payload: {
    username: string;
    password?: string;
    isPermanent: boolean;
    empNo?: string;
    isActive: boolean;
  },
) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ManagedUser>(res);
}

export type RequestStatus =
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'FULFILLED';

export type SupportRequest = {
  id: number;
  userId: string;
  requestType: 'ASSET' | 'IT_SUPPORT';
  status: RequestStatus;
  title: string;
  location: string;
  description: string;
  createdAt: string;
};

export type AdminSupportRequest = SupportRequest & {
  user: { id: string; name: string; username: string } | null;
};

export type UpdateableRequestStatus =
  | 'FULFILLED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'CLOSED';

export async function createSupportRequest(payload: {
  requestType: 'ASSET' | 'IT_SUPPORT';
  title: string;
  location: string;
  description: string;
}) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<SupportRequest>(res);
}

export async function fetchMyRequests(params: ListQuery = {}) {
  const res = await fetch(`${API_BASE}/requests/mine${toQuery(params)}`, {
    headers: authHeaders(),
  });
  return handleResponse<Paginated<SupportRequest>>(res);
}

export async function fetchMyRequestById(id: number) {
  const res = await fetch(`${API_BASE}/requests/mine/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<AdminSupportRequest>(res);
}

export async function fetchAllRequests(params: ListQuery = {}) {
  const res = await fetch(`${API_BASE}/requests${toQuery(params)}`, {
    headers: authHeaders(),
  });
  return handleResponse<Paginated<AdminSupportRequest>>(res);
}

export async function fetchRequestById(id: number) {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<AdminSupportRequest>(res);
}

export async function updateRequestStatus(
  id: number,
  status: UpdateableRequestStatus,
) {
  const res = await fetch(`${API_BASE}/requests/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse<SupportRequest>(res);
}

export function formatRequestStatus(status: string) {
  if (status === 'SUBMITTED') return 'Submitted';
  if (status === 'FULFILLED' || status === 'APPROVED') return 'Fulfilled';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'CLOSED') return 'Closed';
  if (status === 'IN_PROGRESS') return 'In Progress';
  return status.replaceAll('_', ' ');
}
