import type { UpdateableRequestStatus } from '../types/request';

export function formatRequestStatus(status: string): string {
  if (status === 'SUBMITTED') return 'Pending';
  if (status === 'FULFILLED' || status === 'APPROVED') return 'Fulfilled';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'CLOSED') return 'Closed';
  if (status === 'IN_PROGRESS') return 'In Progress';
  if (status === 'PENDING_USER') return 'Pending User';
  if (status === 'PENDING_VENDOR') return 'Pending Vendor';
  if (status === 'ON_HOLD') return 'On Hold';
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
  if (status === 'IN_PROGRESS') return 'badge badge-it';
  if (status === 'PENDING_USER') return 'badge badge-pending-user';
  if (status === 'PENDING_VENDOR') return 'badge badge-pending-vendor';
  if (status === 'ON_HOLD') return 'badge badge-on-hold';
  return 'badge badge-contract';
}

export function toastForStatus(status: UpdateableRequestStatus): string {
  if (status === 'FULFILLED') return 'Request marked as fulfilled';
  if (status === 'REJECTED') return 'Request rejected successfully';
  if (status === 'RESOLVED') return 'Ticket marked as resolved';
  if (status === 'CLOSED') return 'Ticket closed successfully';
  if (status === 'IN_PROGRESS') return 'Request marked as in progress';
  if (status === 'PENDING_USER') return 'Request marked as pending user';
  if (status === 'PENDING_VENDOR') return 'Request marked as pending vendor';
  if (status === 'ON_HOLD') return 'Request put on hold';
  return 'Request status updated';
}

const OPEN_REQUEST_STATUSES = new Set([
  'SUBMITTED',
  'IN_PROGRESS',
  'PENDING_USER',
  'PENDING_VENDOR',
  'ON_HOLD',
]);

export function canTakeRequestAction(status: string): boolean {
  return OPEN_REQUEST_STATUSES.has(status);
}

const TERMINAL_REQUEST_STATUSES = new Set([
  'FULFILLED',
  'APPROVED',
  'REJECTED',
  'RESOLVED',
  'CLOSED',
]);

/** Admin may assign/reassign only while the ticket is not finished. */
export function canAssignRequest(status: string): boolean {
  return !TERMINAL_REQUEST_STATUSES.has(status);
}

export const WORKFLOW_STATUS_OPTIONS: {
  value: UpdateableRequestStatus;
  label: string;
}[] = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_USER', label: 'Pending User' },
  { value: 'PENDING_VENDOR', label: 'Pending Vendor' },
  { value: 'ON_HOLD', label: 'On Hold' },
];
