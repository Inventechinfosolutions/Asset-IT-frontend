import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchAllRequests,
  formatRequestStatus,
  type AdminSupportRequest,
} from '../api';
import { PaginationBar } from '../components/PaginationBar';
import {
  ActionIcon,
  EyeIcon,
  canTakeRequestAction,
} from '../components/RequestActionIcons';

function statusBadgeClass(status: string) {
  if (status === 'FULFILLED' || status === 'APPROVED' || status === 'RESOLVED') {
    return 'badge badge-role';
  }
  if (status === 'REJECTED') return 'badge badge-rejected';
  if (status === 'SUBMITTED') return 'badge badge-submitted';
  if (status === 'CLOSED') return 'badge badge-closed';
  return 'badge badge-contract';
}

export function AdminRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminSupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setLoading(true);
      try {
        const result = await fetchAllRequests({
          page,
          limit,
          search,
        });
        if (!cancelled) {
          setRequests(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load requests',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [page, search, limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function onLimitChange(nextLimit: number) {
    setPage(1);
    setLimit(nextLimit);
  }

  return (
    <div className="page">
      {error ? <p className="error">{error}</p> : null}

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

        {loading ? (
          <p className="muted">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="muted">No requests found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
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
                      <td>{r.id}</td>
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
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => navigate(`/requests/${r.id}`)}
                            aria-label={`View request ${r.id}`}
                            title="View"
                          >
                            <EyeIcon />
                          </button>
                          {canTakeRequestAction(r.status) ? (
                            <button
                              type="button"
                              className="btn-icon btn-icon-action"
                              onClick={() => navigate(`/requests/${r.id}`)}
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
    </div>
  );
}
