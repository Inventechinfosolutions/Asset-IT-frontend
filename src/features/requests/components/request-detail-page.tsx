import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AssetLinesTable } from './asset-line-picker';
import { useUpdateRequestStatus } from '../hooks/use-request-mutations';
import { useMyRequestDetail, useRequestDetail } from '../hooks/use-requests';
import type { UpdateableRequestStatus } from '../types/request';
import {
  canTakeRequestAction,
  formatRequestStatus,
  statusBadgeClass,
  WORKFLOW_STATUS_OPTIONS,
} from '../utils/format-status';

interface RequestDetailPageProps {
  isAdmin?: boolean;
}

export function RequestDetailPage({ isAdmin = false }: RequestDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const requestId = Number(id);

  const [selectedStatus, setSelectedStatus] = useState<
    UpdateableRequestStatus | ''
  >('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const adminQuery = useRequestDetail(isAdmin && requestId ? requestId : 0);
  const userQuery = useMyRequestDetail(!isAdmin && requestId ? requestId : 0);
  const query = isAdmin ? adminQuery : userQuery;
  const { data: request, isPending, isError, error } = query;
  const updateStatusMutation = useUpdateRequestStatus();

  const backTo = isAdmin ? '/requests' : '/portal';
  const isAsset = request?.requestType === 'ASSET';

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
      navigate(backTo);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to update status',
      );
    }
  }

  return (
    <div className="page raise-request-page">
      <div className="page-header page-header-row">
        <div>
          <h1>Request Details</h1>
          <p className="muted">
            {isAdmin
              ? 'Review request details and take action'
              : 'View your submitted request'}
          </p>
        </div>
      </div>

      {isPending ? (
        <section className="raise-request-card">
          <div className="raise-request-form">
            <p className="muted">Loading request details…</p>
          </div>
        </section>
      ) : isError || !request || !Number.isFinite(requestId) ? (
        <section className="raise-request-card">
          <div className="raise-request-form">
            <p className="error">
              {error instanceof Error
                ? error.message
                : 'Failed to load request'}
            </p>
            <div className="raise-request-actions">
              <button type="button" onClick={() => navigate(backTo)}>
                Back
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="raise-request-card">
          <div className="raise-request-form">
            <div className="raise-request-type-row">
              <span className="raise-request-section-label">Request type</span>
              <div className="raise-request-check-row">
                <label className="check">
                  <input type="checkbox" checked={isAsset} disabled readOnly />
                  Asset request
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!isAsset}
                    disabled
                    readOnly
                  />
                  IT support ticket
                </label>
              </div>
            </div>

            <div className="raise-request-meta-row">
              <div className="raise-meta-item">
                <span className="raise-field-label">Status</span>
                <span className={statusBadgeClass(request.status)}>
                  {formatRequestStatus(request.status)}
                </span>
              </div>
              <div className="raise-meta-item">
                <span className="raise-field-label">Created</span>
                <span className="raise-meta-value">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              {isAdmin ? (
                <div className="raise-meta-item">
                  <span className="raise-field-label">User</span>
                  <span className="raise-meta-value">
                    {request.user?.aliasName || request.user?.name || '—'}
                  </span>
                </div>
              ) : null}
            </div>

            <div
              className={
                isAsset
                  ? 'raise-request-grid is-asset is-readonly'
                  : 'raise-request-grid is-it is-readonly'
              }
            >
              {isAsset ? (
                <div className="raise-field raise-field-assets">
                  <span className="raise-field-label">Assets</span>
                  <div className="raise-readonly-box">
                    {request.selectedAssets?.length
                      ? request.selectedAssets
                          .map((row) => row.name)
                          .join(', ')
                      : '—'}
                  </div>
                </div>
              ) : null}

              <div className="raise-field raise-field-title">
                <span className="raise-field-label">Title</span>
                <div className="raise-readonly-box">{request.title || '—'}</div>
              </div>

              {isAsset && request.selectedAssets?.length ? (
                <div className="raise-field raise-field-asset-table">
                  <AssetLinesTable rows={request.selectedAssets} />
                </div>
              ) : null}

              <div className="raise-field raise-field-zone">
                <span className="raise-field-label">Zone</span>
                <div className="raise-readonly-box">{request.zone || '—'}</div>
              </div>

              <div className="raise-field raise-field-location">
                <span className="raise-field-label">Address / Location</span>
                <div className="raise-readonly-box">
                  {request.location || '—'}
                </div>
              </div>

              <div className="raise-field raise-field-description">
                <span className="raise-field-label">Description</span>
                <div className="raise-readonly-box raise-readonly-box-tall">
                  {request.description || '—'}
                </div>
              </div>
            </div>

            {isAdmin && canTakeRequestAction(request.status) ? (
              <form className="status-action-form raise-status-form" onSubmit={onSaveStatus}>
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
                    {isAsset ? (
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
                    onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                    maxLength={2000}
                    rows={3}
                    placeholder="Add a comment for this status update"
                  />
                </label>
                {formError ? <p className="error">{formError}</p> : null}
                <div className="raise-request-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => navigate(backTo)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      updateStatusMutation.isPending || !selectedStatus
                    }
                  >
                    {updateStatusMutation.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {request.adminComment ? (
                  <div className="raise-field">
                    <span className="raise-field-label">Comment</span>
                    <div className="raise-readonly-box raise-readonly-box-tall">
                      {request.adminComment}
                    </div>
                  </div>
                ) : null}
                <div className="raise-request-actions">
                  <button type="button" onClick={() => navigate(backTo)}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
