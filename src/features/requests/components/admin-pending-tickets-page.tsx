import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaginationBar } from '@/components/ui/pagination-bar';

import { EyeIcon } from './request-action-icons';
import { useAllRequests } from '../hooks/use-requests';
import {
  formatRequestStatus,
  statusBadgeClass,
} from '../utils/format-status';

type RequestTypeFilter = '' | 'ASSET' | 'IT_SUPPORT';
type StatusFilter =
  | ''
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'PENDING_VENDOR'
  | 'ON_HOLD'
  | 'FULFILLED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'CLOSED';

const REQUEST_TYPE_FILTERS: { value: RequestTypeFilter; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'SUBMITTED', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_USER', label: 'Pending User' },
  { value: 'PENDING_VENDOR', label: 'Pending Vendor' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export function AdminPendingTicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] =
    useState<RequestTypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('SUBMITTED');
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!typeFilterOpen && !statusFilterOpen) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!typeFilterRef.current?.contains(target)) {
        setTypeFilterOpen(false);
      }
      if (!statusFilterRef.current?.contains(target)) {
        setStatusFilterOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setTypeFilterOpen(false);
        setStatusFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [typeFilterOpen, statusFilterOpen]);

  const { data, isPending, isError, error } = useAllRequests({
    page,
    limit,
    search: search || undefined,
    requestType: requestTypeFilter || undefined,
    status: statusFilter || undefined,
  });

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const selectedTypeLabel =
    REQUEST_TYPE_FILTERS.find((item) => item.value === requestTypeFilter)
      ?.label || 'All types';
  const selectedStatusLabel =
    STATUS_FILTERS.find((item) => item.value === statusFilter)?.label ||
    'All statuses';

  return (
    <div className="page">
      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

      <section className="panel">
        <h2>Pending Tickets</h2>
        <p className="muted" style={{ marginTop: '-0.35rem' }}>
          View all tickets and their assignment status. Use Assign Tickets to
          assign unassigned requests.
        </p>
        <div className="table-toolbar">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
          />
          <div className="table-filter-dropdown" ref={statusFilterRef}>
            <button
              type="button"
              className="table-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={statusFilterOpen}
              aria-label="Filter by status"
              onClick={() => {
                setStatusFilterOpen((open) => !open);
                setTypeFilterOpen(false);
              }}
            >
              <span>{selectedStatusLabel}</span>
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
            {statusFilterOpen ? (
              <div
                className="table-filter-menu form-department-menu"
                role="listbox"
              >
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="option"
                    aria-selected={statusFilter === item.value}
                    className={
                      statusFilter === item.value
                        ? 'table-filter-option is-selected'
                        : 'table-filter-option'
                    }
                    onClick={() => {
                      setPage(1);
                      setStatusFilter(item.value);
                      setStatusFilterOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="table-filter-dropdown" ref={typeFilterRef}>
            <button
              type="button"
              className="table-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={typeFilterOpen}
              aria-label="Filter by request type"
              onClick={() => {
                setTypeFilterOpen((open) => !open);
                setStatusFilterOpen(false);
              }}
            >
              <span>{selectedTypeLabel}</span>
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
            {typeFilterOpen ? (
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
                      setTypeFilterOpen(false);
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
          <p className="muted">No pending tickets found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Request</th>
                    <th>User</th>
                    <th>Emp No</th>
                    <th>Department</th>
                    <th>Request Type</th>
                    <th>Title</th>
                    <th>Zone</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, index) => (
                    <tr key={r.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <span className="cell-mono">
                          {r.requestCode ||
                            `REQ-${String(r.id).padStart(2, '0')}`}
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
                      <td>
                        {r.assignee?.name || r.assignee?.aliasName || '—'}
                      </td>
                      <td className="cell-muted">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() =>
                              navigate(`/requests/${r.id}`, {
                                state: { from: '/pending-tickets' },
                              })
                            }
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
