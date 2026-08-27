import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createUserApi, updateUserApi } from '../api/users-api';
import { usersKeys } from '../keys/users-keys';
import type { CreateUserInput, UpdateUserInput } from '../types/user';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUserApi(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(`Employee "${user.username}" created successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create employee');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUserApi(id, input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(`Employee "${user.username}" updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update employee');
    },
  });
}
