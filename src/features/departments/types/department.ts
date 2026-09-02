import { z } from 'zod';

import {
  createDepartmentSchema,
  departmentSchema,
  paginatedDepartmentsSchema,
  updateDepartmentSchema,
} from '../schemas/department.schema';

export type Department = z.infer<typeof departmentSchema>;
export type PaginatedDepartments = z.infer<typeof paginatedDepartmentsSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
