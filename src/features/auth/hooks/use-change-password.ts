import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { changePasswordApi } from '../api/login';
import type { ChangePasswordInput } from '../types/auth';

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePasswordApi(input),
    onSuccess: () => {
      toast.success('Password updated successfully. Please log in again.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update password');
    },
  });
}
