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
};
