import type { ListQueryParams } from '@/types/pagination';

export type UsersListQueryParams = ListQueryParams & {
  isActive?: boolean;
  employmentType?: 'Permanent' | 'Contract';
};
