import { useEffect, useState, type FormEvent } from 'react';

import type { ManagedUser } from '@/features/users';

import type { AdminSupportRequest } from '../types/request';

interface AssignTicketModalProps {
  request: AdminSupportRequest;
  assignees: ManagedUser[];
  isLoading: boolean;
  onClose: () => void;
  onAssign: (assigneeId: string) => Promise<void>;
}

export function AssignTicketModal({
  request,
  assignees,
  isLoading,
  onClose,
  onAssign,
}: AssignTicketModalProps) {
  const [assigneeId, setAssigneeId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!assigneeId) {
      setFormError('Please select a ticket assignee');
      return;
    }
    setFormError('');
    try {
      await onAssign(assigneeId);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to assign ticket',
      );
    }
  }

  const requestCode =
    request.requestCode || `REQ-${String(request.id).padStart(2, '0')}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-ticket-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-blue">
          <h2 id="assign-ticket-title">Assign Ticket</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <p className="muted" style={{ marginTop: 0 }}>
            Assign <strong>{requestCode}</strong>
            {request.title ? ` — ${request.title}` : ''} to a Ticket Assignee.
          </p>

          <label>
            Ticket Assignee
            <select
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                setFormError('');
              }}
              required
              disabled={assignees.length === 0 || isLoading}
            >
              <option value="">Select assignee</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.aliasName}
                  {user.department ? ` (${user.department})` : ''}
                </option>
              ))}
            </select>
          </label>

          {assignees.length === 0 ? (
            <p className="muted">
              No Ticket Assignees found. Create one under Users first.
            </p>
          ) : null}

          {formError ? <p className="error">{formError}</p> : null}

          <div className="modal-actions">
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || assignees.length === 0 || !assigneeId}
            >
              {isLoading ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
