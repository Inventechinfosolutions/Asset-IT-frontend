import { useEffect, useState } from 'react';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { ActionIcon, EyeIcon } from './request-action-icons';
import { RequestDetailModal } from './request-detail-modal';
import { useAllRequests } from '../hooks/use-requests';
import {
  canTakeRequestAction,
  formatRequestStatus,
  statusBadgeClass,
} from '../utils/format-status';

export function AdminRequestsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useAllRequests({
    page,
    limit,
    search: search || undefined,
  });

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  function onLimitChange(nextLimit: number) {
    setPage(1);
    setLimit(nextLimit);
  }

  return (
    <div className="page">
      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

      <section className="panel">
        <h2>Pending Requests</h2>
        <div className="table-toolbar">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
          />
        </div>

        {isPending ? (
          <p className="muted">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="muted">No requests found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Address</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="cell-name">
                          {r.user?.username || r.user?.name || '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            r.requestType === 'ASSET'
                              ? 'badge badge-permanent'
                              : 'badge badge-it'
                          }
                        >
                          {r.requestType === 'ASSET' ? 'Asset' : 'IT Support'}
                        </span>
                      </td>
                      <td className="cell-preview">{r.title || '—'}</td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.location || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.description || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={statusBadgeClass(r.status)}>
                          {formatRequestStatus(r.status)}
                        </span>
                      </td>
                      <td className="cell-muted">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setSelectedRequestId(r.id)}
                            aria-label={`View request ${r.id}`}
                            title="View"
                          >
                            <EyeIcon />
                          </button>
                          {canTakeRequestAction(r.status) ? (
                            <button
                              type="button"
                              className="btn-icon btn-icon-action"
                              onClick={() => setSelectedRequestId(r.id)}
                              aria-label={`Update request ${r.id}`}
                              title="Take action"
                            >
                              <ActionIcon />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={onLimitChange}
            />
          </>
        )}
      </section>

      <RequestDetailModal
        isOpen={selectedRequestId !== null}
        onClose={() => setSelectedRequestId(null)}
        requestId={selectedRequestId}
        isAdmin
      />
    </div>
  );
}
