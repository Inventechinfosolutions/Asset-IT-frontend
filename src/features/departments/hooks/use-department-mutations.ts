import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createDepartmentApi,
  updateDepartmentApi,
} from '../api/departments-api';
import { departmentsKeys } from '../keys/departments-keys';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../types/department';

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartmentApi(input),
    onSuccess: (department) => {
      queryClient.invalidateQueries({ queryKey: departmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentsKeys.active() });
      toast.success(`Department "${department.name}" created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create department');
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateDepartmentInput;
    }) => updateDepartmentApi(id, input),
    onSuccess: (department) => {
      queryClient.invalidateQueries({ queryKey: departmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentsKeys.active() });
      toast.success(`Department "${department.name}" updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update department');
    },
  });
}
