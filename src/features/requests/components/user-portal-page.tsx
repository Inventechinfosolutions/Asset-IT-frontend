import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { EyeIcon } from './request-action-icons';
import { useMyRequests } from '../hooks/use-requests';
import { formatRequestStatus, statusBadgeClass } from '../utils/format-status';

export function UserPortalPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useMyRequests({
    page,
    limit,
    search: search || undefined,
  });

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div />
        <button
          type="button"
          className="btn-raise"
          onClick={() => navigate('/portal/raise-request')}
        >
          Raise Request
        </button>
      </div>

      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

      <section className="panel">
        <h2>My Requests</h2>
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
                    <th>S.No</th>
                    <th>Request</th>
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
                  {requests.map((r, index) => (
                    <tr key={r.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <span className="cell-mono">
                          {r.requestCode || `REQ-${String(r.id).padStart(2, '0')}`}
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
                      <td>
                        <span className="cell-name">{r.title || '—'}</span>
                      </td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.location || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="cell-description-scroll">
                          {r.description}
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
                            onClick={() => navigate(`/portal/requests/${r.id}`)}
                            aria-label={`View request ${r.id}`}
                            title="View"
                          >
                            <EyeIcon />
                          </button>
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
            />
          </>
        )}
      </section>
    </div>
  );
}
