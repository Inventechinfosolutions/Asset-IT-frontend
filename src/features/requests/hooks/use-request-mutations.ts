import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { notificationsKeys } from '@/features/notifications';

import {
  createSupportRequestApi,
  updateRequestStatusApi,
} from '../api/requests-api';
import { requestsKeys } from '../keys/requests-keys';
import type {
  CreateSupportRequestInput,
  UpdateableRequestStatus,
} from '../types/request';
import { toastForStatus } from '../utils/format-status';

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupportRequestInput) =>
      createSupportRequestApi(input),
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      toast.success(
        request.requestType === 'ASSET'
          ? 'Asset request submitted successfully'
          : 'IT support ticket submitted successfully',
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Submit failed');
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
    }: {
      id: number;
      status: UpdateableRequestStatus;
      comment: string;
    }) => updateRequestStatusApi(id, status, comment),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: requestsKeys.adminDetail(updated.id),
      });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success(
        toastForStatus(updated.status as UpdateableRequestStatus),
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status');
    },
  });
}
