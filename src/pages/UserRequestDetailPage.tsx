import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  fetchMyRequestById,
  formatRequestStatus,
  type AdminSupportRequest,
} from '../api';

function statusBadgeClass(status: string) {
  if (status === 'FULFILLED' || status === 'APPROVED' || status === 'RESOLVED') {
    return 'badge badge-role';
  }
  if (status === 'REJECTED') return 'badge badge-rejected';
  if (status === 'SUBMITTED') return 'badge badge-submitted';
  if (status === 'CLOSED') return 'badge badge-closed';
  return 'badge badge-contract';
}

export function UserRequestDetailPage() {
  const { id } = useParams();
  const requestId = Number(id);

  const [request, setRequest] = useState<AdminSupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isFinite(requestId) || requestId <= 0) {
      setError('Invalid request id');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchMyRequestById(requestId);
        if (!cancelled) {
          setRequest(data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load request',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Request</h1>
          <p className="muted">View your request details.</p>
        </div>
        <Link to="/portal" className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      {loading ? <p className="muted">Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && request ? (
        <section className="panel request-detail-panel">
          <div className="detail-grid">
            <div className="detail-meta-row">
              <div className="detail-inline">
                <span className="detail-label">Type</span>
                <span className="detail-value">
                  {request.requestType === 'ASSET' ? 'Asset' : 'IT Support'}
                </span>
              </div>
              <div className="detail-inline">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={statusBadgeClass(request.status)}>
                    {formatRequestStatus(request.status)}
                  </span>
                </span>
              </div>
              <div className="detail-inline">
                <span className="detail-label">Created</span>
                <span className="detail-value">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="detail-full">
              <div className="detail-inline">
                <span className="detail-label">Title</span>
                <span className="detail-value">{request.title || '—'}</span>
              </div>
            </div>
            <div className="detail-full detail-address-block">
              <p className="detail-label">Address / Location</p>
              <p className="detail-value detail-address-text">
                {request.location || '—'}
              </p>
            </div>
            <div className="detail-full">
              <p className="detail-label">Description</p>
              <p className="detail-value detail-description">
                {request.description || '—'}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
