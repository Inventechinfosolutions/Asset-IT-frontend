import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaginationBar } from '@/components/ui/pagination-bar';
import { useUsers } from '@/features/users';

import { AssignTicketModal } from './assign-ticket-modal';
import { EyeIcon } from './request-action-icons';
import { useAssignRequest } from '../hooks/use-request-mutations';
import { useAllRequests } from '../hooks/use-requests';
import type { AdminSupportRequest } from '../types/request';
import {
  formatRequestStatus,
  statusBadgeClass,
} from '../utils/format-status';

type RequestTypeFilter = '' | 'ASSET' | 'IT_SUPPORT';
type AssignmentFilter = 'unassigned' | 'assigned' | 'all';

const REQUEST_TYPE_FILTERS: { value: RequestTypeFilter; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
];

const ASSIGNMENT_FILTERS: { value: AssignmentFilter; label: string }[] = [
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'all', label: 'All tickets' },
];

export function AssignTicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] =
    useState<RequestTypeFilter>('');
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>('unassigned');
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [assignmentFilterOpen, setAssignmentFilterOpen] = useState(false);
  const [assignRequest, setAssignRequest] =
    useState<AdminSupportRequest | null>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const assignmentFilterRef = useRef<HTMLDivElement>(null);

  const assignMutation = useAssignRequest();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!typeFilterOpen && !assignmentFilterOpen) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!typeFilterRef.current?.contains(target)) {
        setTypeFilterOpen(false);
      }
      if (!assignmentFilterRef.current?.contains(target)) {
        setAssignmentFilterOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setTypeFilterOpen(false);
        setAssignmentFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [typeFilterOpen, assignmentFilterOpen]);

  const listParams = {
    page,
    limit,
    search: search || undefined,
    requestType: requestTypeFilter || undefined,
    status: assignmentFilter === 'unassigned' ? ('SUBMITTED' as const) : undefined,
    unassigned:
      assignmentFilter === 'unassigned'
        ? true
        : assignmentFilter === 'assigned'
          ? false
          : undefined,
  };

  const { data, isPending, isError, error } = useAllRequests(listParams);

  const { data: assigneesData } = useUsers({
    page: 1,
    limit: 100,
    role: 'TICKET_ASSIGNEE',
    isActive: true,
  });

  const requests = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const assignees = assigneesData?.data || [];
  const selectedTypeLabel =
    REQUEST_TYPE_FILTERS.find((item) => item.value === requestTypeFilter)
      ?.label || 'All types';
  const selectedAssignmentLabel =
    ASSIGNMENT_FILTERS.find((item) => item.value === assignmentFilter)?.label ||
    'Unassigned';

  async function onAssign(assigneeId: string) {
    if (!assignRequest) return;
    await assignMutation.mutateAsync({
      id: assignRequest.id,
      assigneeId,
    });
    setAssignRequest(null);
  }

  return (
    <div className="page">
      {isError ? (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load requests'}
        </p>
      ) : null}

      <section className="panel">
        <h2>Assign Tickets</h2>
        <p className="muted" style={{ marginTop: '-0.35rem' }}>
          Assign submitted tickets to a Ticket Assignee. Assignees handle status
          updates.
        </p>
        <div className="table-toolbar">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
          />
          <div className="table-filter-dropdown" ref={assignmentFilterRef}>
            <button
              type="button"
              className="table-filter-trigger"
              aria-haspopup="listbox"
              aria-expanded={assignmentFilterOpen}
              aria-label="Filter by assignment"
              onClick={() => {
                setAssignmentFilterOpen((open) => !open);
                setTypeFilterOpen(false);
              }}
            >
              <span>{selectedAssignmentLabel}</span>
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
            {assignmentFilterOpen ? (
              <div className="table-filter-menu" role="listbox">
                {ASSIGNMENT_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={assignmentFilter === item.value}
                    className={
                      assignmentFilter === item.value
                        ? 'table-filter-option is-selected'
                        : 'table-filter-option'
                    }
                    onClick={() => {
                      setPage(1);
                      setAssignmentFilter(item.value);
                      setAssignmentFilterOpen(false);
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
                setAssignmentFilterOpen(false);
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
          <p className="muted">No tickets found.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Request</th>
                    <th>User</th>
                    <th>Department</th>
                    <th>Request Type</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, index) => {
                    const isUnassigned = !r.assigneeId && !r.assignee;
                    return (
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
                        <td>{r.user?.department || '—'}</td>
                        <td>
                          <span
                            className={
                              r.requestType === 'ASSET'
                                ? 'badge badge-permanent'
                                : 'badge badge-it'
                            }
                          >
                            {r.requestType === 'ASSET'
                              ? 'Asset'
                              : 'IT Support'}
                          </span>
                        </td>
                        <td className="cell-preview">{r.title || '—'}</td>
                        <td>
                          <span className={statusBadgeClass(r.status)}>
                            {formatRequestStatus(r.status)}
                          </span>
                        </td>
                        <td>
                          {r.assignee?.name ||
                            r.assignee?.aliasName ||
                            '—'}
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
                                  state: { from: '/assign-tickets' },
                                })
                              }
                              aria-label={`View request ${r.id}`}
                              title="View"
                            >
                              <EyeIcon />
                            </button>
                            {isUnassigned ? (
                              <button
                                type="button"
                                className="btn-icon btn-icon-action"
                                aria-haspopup="dialog"
                                aria-label={`Assign request ${r.id}`}
                                title="Assign"
                                disabled={assignMutation.isPending}
                                onClick={() => setAssignRequest(r)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  aria-hidden="true"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" y1="8" x2="19" y2="14" />
                                  <line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {assignRequest ? (
        <AssignTicketModal
          request={assignRequest}
          assignees={assignees}
          isLoading={assignMutation.isPending}
          onClose={() => setAssignRequest(null)}
          onAssign={onAssign}
        />
      ) : null}
    </div>
  );
}
