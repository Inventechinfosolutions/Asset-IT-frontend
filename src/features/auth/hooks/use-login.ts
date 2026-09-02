import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from './use-auth';
import type { LoginInput } from '../types/auth';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginInput) => login(credentials),
    onSuccess: (user) => {
      if (user.mustChangePassword) {
        toast.success('Please reset your temporary password to continue');
        return;
      }
      toast.success(`Welcome back, ${user.name || user.aliasName}!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    },
  });
}
