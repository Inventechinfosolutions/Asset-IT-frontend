import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { ActionIcon, EyeIcon } from './request-action-icons';
import { useAllRequests } from '../hooks/use-requests';
import {
  canTakeRequestAction,
  formatRequestStatus,
  statusBadgeClass,
} from '../utils/format-status';

type RequestTypeFilter = '' | 'ASSET' | 'IT_SUPPORT';

const REQUEST_TYPE_FILTERS: { value: RequestTypeFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
];

export function AdminRequestsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] =
    useState<RequestTypeFilter>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!filterOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filterOpen]);

  const { data, isPending, isError, error } = useAllRequests({
    page,
    limit,
    search: search || undefined,
    requestType: requestTypeFilter || undefined,
  });

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const selectedFilterLabel =
    REQUEST_TYPE_FILTERS.find((item) => item.value === requestTypeFilter)
      ?.label || 'All';

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
          <div className="table-filter-dropdown" ref={filterRef}>
            <button
              type="button"
              className="table-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              aria-label="Filter by request type"
              onClick={() => setFilterOpen((open) => !open)}
            >
              <span>{selectedFilterLabel}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {filterOpen ? (
              <div className="table-filter-menu" role="listbox">
                {REQUEST_TYPE_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="option"
                    aria-selected={requestTypeFilter === item.value}
                    className={
                      requestTypeFilter === item.value
                        ? 'table-filter-option is-selected'
                        : 'table-filter-option'
                    }
                    onClick={() => {
                      setPage(1);
                      setRequestTypeFilter(item.value);
                      setFilterOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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
                    <th>Request ID</th>
                    <th>User</th>
                    <th>Emp No</th>
                    <th>Department</th>
                    <th>Request Type</th>
                    <th>Title</th>
                    <th>Zone</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="cell-mono">
                          {r.requestCode || `REQ-${String(r.id).padStart(2, '0')}`}
                        </span>
                      </td>
                      <td>
                        <span className="cell-name">
                          {r.user?.name || r.user?.aliasName || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono">
                          {r.user?.empNo || '—'}
                        </span>
                      </td>
                      <td>{r.user?.department || '—'}</td>
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
                      <td>{r.zone || '—'}</td>
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
