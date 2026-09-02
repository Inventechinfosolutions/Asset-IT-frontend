export { DepartmentsPage } from './components/departments-page';
export { DepartmentModal } from './components/department-modal';
export { useDepartments, useActiveDepartments, useDepartmentOptions } from './hooks/use-departments';
export {
  useCreateDepartment,
  useUpdateDepartment,
} from './hooks/use-department-mutations';
export { departmentsKeys } from './keys/departments-keys';
export {
  activeDepartmentsQueryOptions,
  departmentsQueryOptions,
} from './query-options/departments-query-options';
export type {
  Department,
  PaginatedDepartments,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './types/department';
