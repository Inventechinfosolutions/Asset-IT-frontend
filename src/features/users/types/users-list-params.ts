import type { ListQueryParams } from '@/types/pagination';

export type UsersListQueryParams = ListQueryParams & {
  isActive?: boolean;
};
