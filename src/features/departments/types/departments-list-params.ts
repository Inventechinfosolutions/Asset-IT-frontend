import type { ListQueryParams } from '@/types/pagination';

export type DepartmentsListQueryParams = ListQueryParams & {
  isActive?: boolean;
};
