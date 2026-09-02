import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createUserApi, resetUserPasswordApi, updateUserApi } from '../api/users-api';
import { usersKeys } from '../keys/users-keys';
import type { CreateUserInput, UpdateUserInput } from '../types/user';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUserApi(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(`Employee "${user.aliasName}" created successfully`);
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
      toast.success(`Employee "${user.aliasName}" updated successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update employee');
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resetUserPasswordApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('Password is Okay@12345');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to reset password');
    },
  });
}
