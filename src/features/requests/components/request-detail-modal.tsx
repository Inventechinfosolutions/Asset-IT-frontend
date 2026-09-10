import { useState, type FormEvent, useEffect } from 'react';

import { useUpdateRequestStatus } from '../hooks/use-request-mutations';
import { useMyRequestDetail, useRequestDetail } from '../hooks/use-requests';
import type { UpdateableRequestStatus } from '../types/request';
import {
  canTakeRequestAction,
  formatRequestStatus,
  statusBadgeClass,
  WORKFLOW_STATUS_OPTIONS,
} from '../utils/format-status';
import { AssetLinesTable } from './asset-line-picker';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number | null;
  isAdmin?: boolean;
}

export function RequestDetailModal({
  isOpen,
  onClose,
  requestId,
  isAdmin = false,
}: RequestDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    UpdateableRequestStatus | ''
  >('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset local state when modal closes or requestId changes
  useEffect(() => {
    setSelectedStatus('');
    setComment('');
    setFormError('');
  }, [requestId, isOpen]);

  const adminQuery = useRequestDetail(
    isAdmin && requestId ? requestId : 0,
  );
  const userQuery = useMyRequestDetail(
    !isAdmin && requestId ? requestId : 0,
  );

  const query = isAdmin ? adminQuery : userQuery;
  const { data: request, isPending, isError, error } = query;
  const updateStatusMutation = useUpdateRequestStatus();

  if (!isOpen) return null;

  const isDevice = request?.requestType === 'DEVICE';

  async function onSaveStatus(e: FormEvent) {
    e.preventDefault();
    if (!request || !selectedStatus) {
      setFormError('Please select a status');
      return;
    }

    const trimmedComment = comment.trim();

    setFormError('');
    try {
      await updateStatusMutation.mutateAsync({
        id: request.id,
        status: selectedStatus,
        comment: trimmedComment,
      });
      setSelectedStatus('');
      setComment('');
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to update status',
      );
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal-request-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-detail-header">
          <div className="modal-detail-title-wrap">
            <h2 id="request-modal-title">Request Details</h2>
            <p className="modal-detail-subtitle">
              {isAdmin
                ? 'Review request details and take action.'
                : 'View your request details.'}
            </p>
          </div>
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

        {isPending ? (
          <div className="modal-detail-loading">
            <div className="modal-detail-spinner" />
            <p className="muted">Loading request details…</p>
          </div>
        ) : isError ? (
          <div className="modal-detail-error">
            <p className="error">
              {error instanceof Error ? error.message : 'Failed to load request'}
            </p>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : request ? (
          <div className="modal-detail-content">
            <div className="detail-inner-card">
              <div className="detail-meta-grid">
                {isAdmin ? (
                  <div className="detail-meta-item">
                    <span className="detail-label">User</span>
                    <span className="detail-value">
                      {request.user?.aliasName || request.user?.name || '—'}
                    </span>
                  </div>
                ) : null}

                <div className="detail-meta-item">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">
                    <span
                      className={
                        request.requestType === 'DEVICE'
                          ? 'badge badge-permanent'
                          : 'badge badge-it'
                      }
                    >
                      {request.requestType === 'DEVICE' ? 'Device' : 'IT Support'}
                    </span>
                  </span>
                </div>

                <div className="detail-meta-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={statusBadgeClass(request.status)}>
                      {formatRequestStatus(request.status)}
                    </span>
                  </span>
                </div>

                <div className="detail-meta-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="detail-body-section">
                <div className="detail-fields-row">
                  <div className="detail-field-group">
                    <span className="detail-label">Title</span>
                    <div className="detail-field-value detail-title-value">
                      {request.title || '—'}
                    </div>
                  </div>

                  <div className="detail-field-group">
                    <span className="detail-label">Zone</span>
                    <div className="detail-field-value">
                      {request.zone || '—'}
                    </div>
                  </div>

                  <div className="detail-field-group">
                    <span className="detail-label">Address / Location</span>
                    <div className="detail-field-value detail-location-value">
                      {request.location || '—'}
                    </div>
                  </div>
                </div>

                <div className="detail-field-group">
                  <span className="detail-label">Description</span>
                  <div className="detail-field-value detail-desc-value">
                    {request.description || '—'}
                  </div>
                </div>

                {request.requestType === 'DEVICE' ? (
                  <div className="detail-field-group">
                    <span className="detail-label">Devices</span>
                    {request.selectedAssets?.length ? (
                      <AssetLinesTable rows={request.selectedAssets} />
                    ) : (
                      <div className="detail-field-value">—</div>
                    )}
                  </div>
                ) : null}
              </div>

              {isAdmin && canTakeRequestAction(request.status) ? (
                <div className="detail-action-footer">
                  <form className="status-action-form" onSubmit={onSaveStatus}>
                    <label>
                      Update status
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as UpdateableRequestStatus | '',
                          )
                        }
                        required
                      >
                        <option value="">Select status</option>
                        {WORKFLOW_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                        {isDevice ? (
                          <>
                            <option value="FULFILLED">Mark as Fulfilled</option>
                            <option value="REJECTED">Rejected</option>
                          </>
                        ) : (
                          <>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </>
                        )}
                      </select>
                    </label>
                    <label>
                      Comment
                      <textarea
                        value={comment}
                        onChange={(e) =>
                          setComment(e.target.value.slice(0, 2000))
                        }
                        maxLength={2000}
                        rows={3}
                        placeholder="Add a comment for this status update"
                      />
                    </label>
                    {formError ? <p className="error">{formError}</p> : null}
                    <button
                      type="submit"
                      disabled={
                        updateStatusMutation.isPending || !selectedStatus
                      }
                    >
                      {updateStatusMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="detail-notice-footer">
                  {request.adminComment ? (
                    <div className="detail-field-group" style={{ marginBottom: '0.75rem' }}>
                      <span className="detail-label">Comment</span>
                      <div className="detail-field-value">
                        {request.adminComment}
                      </div>
                    </div>
                  ) : null}
                  <span className="detail-notice-text">
                    This request status is currently{' '}
                    <strong>
                      {formatRequestStatus(request.status).toLowerCase()}
                    </strong>
                    .
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
