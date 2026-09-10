export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  requestType?: 'DEVICE' | 'IT_SUPPORT';
  status?: string;
  unassigned?: boolean;
  assigneeId?: string;
};
