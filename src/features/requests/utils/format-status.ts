import type { UpdateableRequestStatus } from '../types/request';

export function formatRequestStatus(status: string): string {
  if (status === 'SUBMITTED') return 'Submitted';
  if (status === 'FULFILLED' || status === 'APPROVED') return 'Fulfilled';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'CLOSED') return 'Closed';
  if (status === 'IN_PROGRESS') return 'In Progress';
  return status.replaceAll('_', ' ');
}

export function statusBadgeClass(status: string): string {
  if (
    status === 'FULFILLED' ||
    status === 'APPROVED' ||
    status === 'RESOLVED'
  ) {
    return 'badge badge-role';
  }
  if (status === 'REJECTED') return 'badge badge-rejected';
  if (status === 'SUBMITTED') return 'badge badge-submitted';
  if (status === 'CLOSED') return 'badge badge-closed';
  return 'badge badge-contract';
}

export function toastForStatus(status: UpdateableRequestStatus): string {
  if (status === 'FULFILLED') return 'Request marked as fulfilled';
  if (status === 'REJECTED') return 'Request rejected successfully';
  if (status === 'RESOLVED') return 'Ticket marked as resolved';
  if (status === 'CLOSED') return 'Ticket closed successfully';
  return 'Request status updated';
}

export function canTakeRequestAction(status: string): boolean {
  return status === 'SUBMITTED' || status === 'IN_PROGRESS';
}
